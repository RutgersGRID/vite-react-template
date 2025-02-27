import React, { useState, useEffect, useRef } from 'react';

// Define types for our component
interface User {
  id: string;
  nickname: string;
  prompt: string;
  color: string;
  model: string;
  timestamp: string;
}

interface Response {
  [key: string]: string;
}

interface Position {
  x: number;
  y: number;
}

interface DragState {
  initialMousePos: Position;
  initialNotePos: Position;
}

interface Positions {
  [key: string]: Position;
}

interface ModelOption {
  id: string;
  name: string;
}

interface ColorOption {
  id: string;
  bg: string;
  border: string;
}

// For real-time synchronization
interface SyncUser {
  userId: string;
  username: string;
  lastActive: number;
  isTyping: boolean;
  color: string;
}

interface SharedState {
  users: User[];
  responses: Response;
  positions: Positions;
  activeUsers: SyncUser[];
  lastUpdated: number;
}

const MultiUserChatbot: React.FC = () => {
  // Initialize with example users
  const initialExampleUsers: User[] = [
    {
      id: 'example-1',
      nickname: 'Marketing Team',
      prompt: 'Write a catchy slogan for our new eco-friendly water bottle',
      color: 'blue',
      model: 'gpt-4',
      timestamp: new Date().toISOString()
    },
    {
      id: 'example-2',
      nickname: 'Tech Support',
      prompt: 'Explain how to troubleshoot a router connection issue to a non-technical person',
      color: 'green',
      model: 'claude-3-sonnet',
      timestamp: new Date().toISOString()
    },
    {
      id: 'example-3',
      nickname: 'Research',
      prompt: 'Compare the environmental impact of electric vs. gas vehicles',
      color: 'purple',
      model: 'claude-3-opus',
      timestamp: new Date().toISOString()
    }
  ];

  // Initial positions for example stickies - keeping them within visible area
  const initialPositions: Positions = {
    'example-1': { x: 350, y: 120 },
    'example-2': { x: 500, y: 220 },
    'example-3': { x: 350, y: 320 }
  };

  // Initial responses for example stickies
  const initialResponses: Response = {
    'example-1': `I've analyzed your request for a catchy slogan. As GPT-4, I suggest: "Wave Goodbye to Plastic, Hello to Fantastic! Our eco-bottles make every drop count while keeping waste amounts down."`,
    'example-2': `I appreciate your question about router troubleshooting. As Claude 3 Sonnet, here's a simple explanation: Imagine your router is like a mailroom for your internet. If it's not working, first try turning it off for 30 seconds then back on - this is like giving it a fresh start. Next, check if the cables are connected properly, like making sure all the mailboxes are closed. If those steps don't work, try moving closer to the router, as distance can weaken the signal.`,
    'example-3': `Thank you for your prompt about comparing environmental impacts. As Claude 3 Opus, I'll approach this thoughtfully. Electric vehicles produce zero tailpipe emissions but their environmental footprint depends heavily on how their electricity is generated. If powered by renewable energy, EVs are significantly cleaner overall. However, manufacturing EV batteries requires resource-intensive mining. Gas vehicles produce direct emissions during operation and indirectly through fuel production. When considering full lifecycle assessment, EVs typically have lower total environmental impact in regions with cleaner electricity grids.`
  };

  // State for local user identification
  const [localUserId, setLocalUserId] = useState<string>('');
  const [localUsername, setLocalUsername] = useState<string>('');
  const [isUsernameSet, setIsUsernameSet] = useState<boolean>(false);
  
  // State for shared data
  const [users, setUsers] = useState<User[]>(initialExampleUsers);
  const [responses, setResponses] = useState<Response>(initialResponses);
  const [positions, setPositions] = useState<Positions>(initialPositions);
  const [activeUsers, setActiveUsers] = useState<SyncUser[]>([]);

  // State for UI elements
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4');
  const [newNickname, setNewNickname] = useState<string>('');
  const [newPrompt, setNewPrompt] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [draggedNote, setDraggedNote] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [formNoteColor, setFormNoteColor] = useState<string>('yellow');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  
  // Timer refs for debouncing and intervals
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastStateUpdateRef = useRef<number>(Date.now());

  // Ref for websocket connection
  const wsRef = useRef<WebSocket | null>(null);
  
  // Simulated websocket URL - replace with your actual WebSocket server in production
  const WS_URL = 'wss://example.com/chatbot-sync';

  // Available LLM models
  const availableModels: ModelOption[] = [
    { id: 'gpt-4', name: 'GPT-4' },
    { id: 'claude-3-opus', name: 'Claude 3 Opus' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet' },
    { id: 'llama-3', name: 'Llama 3' },
    { id: 'gemini-pro', name: 'Gemini Pro' }
  ];

  // Sticky note color options
  const colorOptions: ColorOption[] = [
    { id: 'yellow', bg: 'bg-yellow-100', border: 'border-yellow-300' },
    { id: 'blue', bg: 'bg-blue-100', border: 'border-blue-300' },
    { id: 'green', bg: 'bg-green-100', border: 'border-green-300' },
    { id: 'pink', bg: 'bg-pink-100', border: 'border-pink-300' },
    { id: 'purple', bg: 'bg-purple-100', border: 'border-purple-300' },
    { id: 'orange', bg: 'bg-orange-100', border: 'border-orange-300' }
  ];

  // Initialize local user on component mount
  useEffect(() => {
    // Generate a unique user ID if not already present in localStorage
    const storedUserId = localStorage.getItem('chatbot_userId');
    const userId = storedUserId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (!storedUserId) {
      localStorage.setItem('chatbot_userId', userId);
    }
    
    setLocalUserId(userId);
    
    // Try to get stored username
    const storedUsername = localStorage.getItem('chatbot_username');
    if (storedUsername) {
      setLocalUsername(storedUsername);
      setIsUsernameSet(true);
    }
    
    // Clean up on unmount
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);

  // Effect to establish WebSocket connection once the username is set
  useEffect(() => {
    if (!isUsernameSet || !localUserId) return;
    
    // In a real application, connect to your WebSocket server
    // For this demo, we'll simulate WebSocket functionality
    simulateWebSocketConnection();
    
    // Set up a sync interval to periodically sync state
    syncIntervalRef.current = setInterval(() => {
      syncSharedState();
    }, 3000); // Sync every 3 seconds
    
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isUsernameSet, localUserId]);

  // Simulate WebSocket connection
  const simulateWebSocketConnection = () => {
    console.log(`Simulating WebSocket connection for user ${localUsername} (${localUserId})`);
    
    // In a real implementation, you would:
    // wsRef.current = new WebSocket(WS_URL);
    // wsRef.current.onopen = handleWebSocketOpen;
    // wsRef.current.onmessage = handleWebSocketMessage;
    // wsRef.current.onclose = handleWebSocketClose;
    
    // For demo, we'll use localStorage to simulate shared state
    // Initialize with any existing shared state
    const storedState = localStorage.getItem('chatbot_sharedState');
    if (storedState) {
      try {
        const parsedState: SharedState = JSON.parse(storedState);
        setUsers(parsedState.users);
        setResponses(parsedState.responses);
        setPositions(parsedState.positions);
        setActiveUsers(parsedState.activeUsers);
      } catch (error) {
        console.error('Error parsing stored state:', error);
      }
    }
    
    // Add this user to active users
    updateActiveUsers();
  };

  // Update active users list
  const updateActiveUsers = () => {
    setActiveUsers(prev => {
      // Filter out this user if already exists
      const filtered = prev.filter(user => user.userId !== localUserId);
      
      // Add this user with updated information
      return [...filtered, {
        userId: localUserId,
        username: localUsername,
        lastActive: Date.now(),
        isTyping,
        color: formNoteColor
      }];
    });
  };

  // Sync the shared state (in a real app, this would send to WebSocket)
  const syncSharedState = () => {
    // Update the timestamp of when we last synced
    lastStateUpdateRef.current = Date.now();
    
    // Update this user's activity status
    updateActiveUsers();
    
    // Create the shared state
    const sharedState: SharedState = {
      users,
      responses,
      positions,
      activeUsers,
      lastUpdated: lastStateUpdateRef.current
    };
    
    // In a real app, send this to the WebSocket server
    // if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
    //   wsRef.current.send(JSON.stringify(sharedState));
    // }
    
    // For demo, store in localStorage to simulate sharing
    localStorage.setItem('chatbot_sharedState', JSON.stringify(sharedState));
    
    // Simulate receiving updates from other users every so often
    simulateOtherUserActivity();
  };

  // Simulate receiving updates from other users
  const simulateOtherUserActivity = () => {
    // Only do this occasionally to simulate real user behavior
    if (Math.random() > 0.7) {
      // Simulate another user's changes
      const simulatedChanges = () => {
        // Randomly decide what kind of change to simulate
        const changeType = Math.floor(Math.random() * 3);
        
        if (changeType === 0 && users.length > 0) {
          // Move a random note
          const randomNoteId = users[Math.floor(Math.random() * users.length)].id;
          const currentPos = positions[randomNoteId] || { x: 0, y: 0 };
          
          const newPositions = { ...positions };
          newPositions[randomNoteId] = {
            x: Math.max(0, Math.min(800, currentPos.x + (Math.random() - 0.5) * 100)),
            y: Math.max(0, Math.min(500, currentPos.y + (Math.random() - 0.5) * 100))
          };
          
          setPositions(newPositions);
        }
        else if (changeType === 1) {
          // Add a simulated user to active users
          const randomUserId = `sim_user_${Math.floor(Math.random() * 1000)}`;
          const randomNames = ['Alex', 'Bailey', 'Casey', 'Dana', 'Eli', 'Francis', 'Gabi'];
          const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
          
          setActiveUsers(prev => {
            // Don't add if already exists
            if (prev.some(u => u.userId === randomUserId)) return prev;
            
            return [...prev, {
              userId: randomUserId,
              username: randomName,
              lastActive: Date.now(),
              isTyping: Math.random() > 0.7,
              color: colorOptions[Math.floor(Math.random() * colorOptions.length)].id
            }];
          });
        }
        else if (changeType === 2 && Math.random() > 0.7) {
          // Add a new note from a simulated user
          const randomUserId = `sim_user_${Math.floor(Math.random() * 1000)}`;
          const randomNames = ['Alex', 'Bailey', 'Casey', 'Dana', 'Eli', 'Francis', 'Gabi'];
          const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
          
          const samplePrompts = [
            'How to improve team collaboration remotely?',
            'Explain quantum computing to a 10-year-old',
            'Best practices for sustainable web development',
            'Create a weekly meal plan for a vegetarian'
          ];
          
          const newNoteId = `sim_note_${Date.now()}`;
          const randomPrompt = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
          const randomModel = availableModels[Math.floor(Math.random() * availableModels.length)].id;
          
          // Add the new user
          const newUser: User = {
            id: newNoteId,
            nickname: `${randomName}'s Note`,
            prompt: randomPrompt,
            color: colorOptions[Math.floor(Math.random() * colorOptions.length)].id,
            model: randomModel,
            timestamp: new Date().toISOString()
          };
          
          setUsers(prev => [...prev, newUser]);
          
          // Position the new note
          const newPositions = { ...positions };
          newPositions[newNoteId] = {
            x: 100 + Math.random() * 600,
            y: 100 + Math.random() * 300
          };
          setPositions(newPositions);
          
          // Generate a response
          setTimeout(() => {
            const response = generateMockResponse(randomModel, randomPrompt);
            setResponses(prev => ({...prev, [newNoteId]: response}));
          }, 500 + Math.random() * 1000);
        }
      };
      
      // Execute the simulated changes
      simulatedChanges();
    }
    
    // Clean up inactive users (who haven't been active for 30 seconds)
    setActiveUsers(prev => 
      prev.filter(user => 
        (Date.now() - user.lastActive < 30000) || user.userId === localUserId
      )
    );
  };

  // Handle WebSocket messages (in a real implementation)
  const handleWebSocketMessage = (event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data) as SharedState;
      
      // Only update if the incoming state is newer than our last update
      if (message.lastUpdated > lastStateUpdateRef.current) {
        setUsers(message.users);
        setResponses(message.responses);
        setPositions(message.positions);
        setActiveUsers(message.activeUsers);
        lastStateUpdateRef.current = message.lastUpdated;
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  };

  // Get color classes based on color ID
  const getColorClasses = (colorId: string): { bg: string; border: string } => {
    const colorOption = colorOptions.find(c => c.id === colorId) || colorOptions[0];
    return { bg: colorOption.bg, border: colorOption.border };
  };

  // Handle username submission
  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localUsername.trim() === '') return;
    
    localStorage.setItem('chatbot_username', localUsername);
    setIsUsernameSet(true);
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      // Update active user status
      updateActiveUsers();
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      updateActiveUsers();
    }, 2000);
  };

  // Function to add a new user with their prompt
  const addUser = (e: React.MouseEvent): void => {
    // Stop event propagation to prevent dragging
    e.stopPropagation();
    e.preventDefault();
    
    // Validate input
    if (newNickname.trim() === '' || newPrompt.trim() === '') {
      alert("Please enter both nickname and prompt");
      return;
    }
    
    const newUserId = `${localUserId}_${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      nickname: newNickname,
      prompt: newPrompt,
      color: formNoteColor,
      model: selectedModel,
      timestamp: new Date().toISOString()
    };
    
    // Generate position with safer bounds
    const newPositions = { ...positions };
    newPositions[newUserId] = {
      x: 350 + (Math.random() * 100),
      y: 150 + (Math.random() * 150)
    };
    
    // Update state
    setPositions(newPositions);
    setUsers(prevUsers => [...prevUsers, newUser]);
    setNewNickname('');
    setNewPrompt('');
    
    // Sync the changes
    setTimeout(() => {
      syncSharedState();
    }, 100);
    
    // Generate response for the new user after a short delay
    setIsProcessing(true);
    setTimeout(() => {
      generateResponseForUser(newUser);
    }, 500);
  };

  // Generate responses for a specific user
  const generateResponseForUser = (user: User): void => {
    if (!user || !user.id) return;
    
    // Simulate API delay
    setTimeout(() => {
      // Generate a mock response based on the model and prompt
      const response = generateMockResponse(user.model, user.prompt);
      
      // Update responses
      setResponses(prev => ({...prev, [user.id]: response}));
      setIsProcessing(false);
      
      // Sync the state after generating the response
      syncSharedState();
    }, 500 + Math.random() * 1000);
  };

  // Generate a mock response based on the model and prompt
  const generateMockResponse = (model: string, prompt: string): string => {
    // Create different response styles based on model
    const responses: {[key: string]: string} = {
      'gpt-4': `I've analyzed your question: "${prompt.substring(0, 30)}..." and here's my response as GPT-4. This answer is helpful and comprehensive, while maintaining a neutral tone. I'll provide factual information and helpful suggestions based on your query.`,
      
      'claude-3-opus': `Thank you for your prompt: "${prompt.substring(0, 30)}..." As Claude 3 Opus, I'll approach this thoughtfully. My response aims to be nuanced and insightful, considering multiple perspectives on your question. I'm designed to be particularly strong with complex reasoning tasks.`,
      
      'claude-3-sonnet': `I appreciate your question about "${prompt.substring(0, 30)}..." As Claude 3 Sonnet, I'll provide a balanced and thoughtful response. I aim to be helpful while maintaining a conversational tone, focusing on providing clear and accurate information.`,
      
      'llama-3': `Regarding "${prompt.substring(0, 30)}..." - As Llama 3, I'll give you a direct answer. My responses tend to be concise but informative, with a focus on factual accuracy and practical application. I'm designed to be efficient while still providing valuable insights.`,
      
      'gemini-pro': `I've processed your question: "${prompt.substring(0, 30)}..." As Gemini Pro, I'll provide a response that emphasizes multimodal understanding. My answer combines factual information with contextual awareness, delivering a comprehensive yet accessible explanation.`
    };
    
    return responses[model] || "No response generated for this model.";
  };

  // Delete a user and their prompts
  const deleteUser = (userId: string, e: React.MouseEvent): void => {
    e.stopPropagation();
    e.preventDefault();
    
    // Only allow deletion of notes created by this user
    if (!userId.includes(localUserId) && !userId.startsWith('example-')) {
      alert("You can only delete your own notes!");
      return;
    }
    
    setUsers(users.filter(user => user.id !== userId));
    
    // Also remove their responses
    const newResponses = {...responses};
    delete newResponses[userId];
    setResponses(newResponses);
    
    // Remove position data
    const newPositions = {...positions};
    delete newPositions[userId];
    setPositions(newPositions);
    
    // Sync these changes
    setTimeout(() => {
      syncSharedState();
    }, 100);
  };
  
  // Change sticky note color
  const changeNoteColor = (userId: string, colorId: string, e: React.MouseEvent): void => {
    e.stopPropagation();
    
    // Only allow changing color of notes created by this user
    if (!userId.includes(localUserId) && !userId.startsWith('example-')) {
      return;
    }
    
    setUsers(users.map(user => 
      user.id === userId ? {...user, color: colorId} : user
    ));
    
    // Sync these changes
    setTimeout(() => {
      syncSharedState();
    }, 100);
  };
  
  // Handle drag start
  const handleDragStart = (e: React.MouseEvent, userId: string): void => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get the current position of this note from our state
    const currentPos = positions[userId] || { x: 0, y: 0 };
    
    // Record the initial state - both mouse position and note position
    setDraggedNote(userId);
    setDragState({
      initialMousePos: { x: e.clientX, y: e.clientY },
      initialNotePos: { ...currentPos }
    });
  };
  
  // Handle drag move
  const handleDragMove = (e: MouseEvent): void => {
    // Make sure we have both a note being dragged and the initial state
    if (!draggedNote || !dragState) return;
    
    // Calculate how far the mouse has moved from the initial position
    const deltaX = e.clientX - dragState.initialMousePos.x;
    const deltaY = e.clientY - dragState.initialMousePos.y;
    
    // Apply this delta to the original position of the note
    const newX = dragState.initialNotePos.x + deltaX;
    const newY = dragState.initialNotePos.y + deltaY;
    
    // Keep within reasonable bounds
    const boundedX = Math.max(0, Math.min(newX, 800));
    const boundedY = Math.max(0, Math.min(newY, 500));
    
    // Update positions
    const newPositions = { ...positions };
    newPositions[draggedNote] = {
      x: boundedX,
      y: boundedY
    };
    
    setPositions(newPositions);
  };
  
  // Handle drag end
  const handleDragEnd = (): void => {
    if (draggedNote) {
      // Sync the new position
      syncSharedState();
    }
    
    setDraggedNote(null);
    setDragState(null);
  };
  
  // Change model for a note
  const changeNoteModel = (userId: string, modelId: string, e: React.ChangeEvent<HTMLSelectElement>): void => {
    e.stopPropagation();
    
    // Only allow changing model of notes created by this user
    if (!userId.includes(localUserId) && !userId.startsWith('example-')) {
      return;
    }
    
    // Stop any current processing
    setIsProcessing(false);
    
    // Update the user's model
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return {...user, model: modelId};
      }
      return user;
    });
    
    setUsers(updatedUsers);
    
    // Sync the changes
    setTimeout(() => {
      syncSharedState();
    }, 100);
    
    // Add a small delay before generating the response
    setTimeout(() => {
      // Find the updated user
      const updatedUser = updatedUsers.find(user => user.id === userId);
      if (updatedUser) {
        // Clear existing response first
        setResponses(prev => ({...prev, [userId]: null}));
        
        // Generate new response for the updated model
        generateResponseForUser(updatedUser);
      }
    }, 500);
  };
  
  // Set up event listeners for drag
  useEffect(() => {
    const handleMouseMoveEvent = (e: MouseEvent): void => {
      e.preventDefault();
      handleDragMove(e);
    };
    
    const handleMouseUpEvent = (): void => {
      handleDragEnd();
    };
    
    if (draggedNote && dragState) {
      window.addEventListener('mousemove', handleMouseMoveEvent);
      window.addEventListener('mouseup', handleMouseUpEvent);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveEvent);
      window.removeEventListener('mouseup', handleMouseUpEvent);
    };
  }, [draggedNote, dragState]);

  // Get current form note color classes
  const formColorClasses = getColorClasses(formNoteColor);

  // Prevent default on mouse down to enable dragging
  const onMouseDown = (e: React.MouseEvent, userId: string): void => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only allow dragging notes created by this user
    if (!userId.includes(localUserId) && !userId.startsWith('example-')) {
      return;
    }
    
    handleDragStart(e, userId);
  };

  // Handle model selection change in the form
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    setSelectedModel(e.target.value);
  };

  // Handle color selection in the form
  const handleColorSelection = (e: React.MouseEvent, colorId: string) => {
    e.stopPropagation();
    setFormNoteColor(colorId);
    
    // Update active user status to show new color
    updateActiveUsers();
  };

  // If username is not set, show the username form
  if (!isUsernameSet) {
    return (
      <div className="flex flex-col p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Multi-User Chatbot</h1>
        
        <div className="max-w-md mx-auto w-full bg-gray-50 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Enter Your Username</h2>
          <form onSubmit={handleUsernameSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Choose a username to identify yourself to other users
              </label>
              <input
                type="text"
                id="username"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={localUsername}
                onChange={(e) => setLocalUsername(e.target.value)}
                placeholder="Enter username..."
                required
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Join Chatbot Session
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-2 text-center">Multi-User Chatbot Comparison</h1>
      
      {/* User status bar */}
      <div className="mb-4 bg-gray-100 p-2 rounded-lg flex items-center">
        <div className="mr-2 font-medium">You: {localUsername}</div>
        <div className={`w-3 h-3 rounded-full bg-green-500 mr-4`}></div>
        
        <div className="text-sm text-gray-600 mr-4">Active Users:</div>
        {activeUsers.filter(user => user.userId !== localUserId).map(user => (
          <div key={user.userId} className="flex items-center mr-3" title={user.username}>
            <div 
              className={`w-6 h-6 rounded-full flex items-center justify-center mr-1 ${getColorClasses(user.color).bg} ${getColorClasses(user.color).border} border`}
            >
              {user.username[0].toUpperCase()}
            </div>
            <span className="text-xs">{user.username.slice(0, 6)}{user.username.length > 6 ? '...' : ''}</span>
            {user.isTyping && <span className="text-xs text-gray-500 italic ml-1">typing...</span>}
          </div>
        ))}
      </div>
      
      {/* Instructions */}
      <div className="mb-4 text-gray-600 text-center">
        <p>Add new sticky notes with different prompts. Drag to organize them. Changes are synchronized with other users.</p>
      </div>
      
      {/* Canvas for sticky notes including the input form */}
      <div className="relative h-[600px] border rounded-lg bg-gray-50 overflow-auto">
        {/* Input Form Sticky Note */}
        <div className={`absolute w-64 p-4 rounded-lg shadow-md ${formColorClasses.bg} ${formColorClasses.border} border-2`}
             style={{ left: '50px', top: '50px' }}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">New Note</h3>
            <div className="flex gap-1">
              {colorOptions.map(color => (
                <button
                  key={color.id}
                  className={`w-4 h-4 rounded-full ${color.bg} border ${color.border} ${formNoteColor === color.id ? 'ring-2 ring-gray-500' : ''}`}
                  onClick={(e) => handleColorSelection(e, color.id)}
                />
              ))}
            </div>
          </div>
          
          <div className="mb-3">
            <input
              type="text"
              placeholder="Note title"
              className="w-full p-2 bg-white bg-opacity-70 border-0 rounded mb-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={newNickname}
              onChange={(e) => {
                e.stopPropagation();
                setNewNickname(e.target.value);
                handleTyping();
              }}
              onClick={(e) => e.stopPropagation()}
              disabled={isProcessing}
            />
            <textarea
              placeholder="Your prompt"
              className="w-full p-2 bg-white bg-opacity-70 border-0 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={newPrompt}
              onChange={(e) => {
                e.stopPropagation();
                setNewPrompt(e.target.value);
                handleTyping();
              }}
              onClick={(e) => e.stopPropagation()}
              disabled={isProcessing}
              rows={3}
            />
          </div>
          
          <div className="mb-3" onClick={(e) => e.stopPropagation()}>
            <select 
              className="w-full p-2 bg-white bg-opacity-70 border-0 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={selectedModel}
              onChange={handleModelChange}
              onClick={(e) => e.stopPropagation()}
              disabled={isProcessing}
            >
              {availableModels.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
          
          <button
            type="button"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm"
            onClick={(e) => addUser(e)}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Add Sticky Note'}
          </button>
        </div>
        
        {/* Sticky Notes */}
        {users.map(user => {
          const colorOption = colorOptions.find(c => c.id === user.color) || colorOptions[0];
          const position = positions[user.id] || { x: 100, y: 100 };
          const modelName = availableModels.find(m => m.id === user.model)?.name || user.model;
          
          // Check if this note was created by the current user
          const isOwnNote = user.id.includes(localUserId) || user.id.startsWith('example-');
          
          return (
            <div 
              key={user.id} 
              className={`absolute w-64 p-4 rounded-lg shadow-md ${colorOption.bg} ${colorOption.border} border-2 ${isOwnNote ? '' : 'cursor-not-allowed'}`}
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                cursor: draggedNote === user.id ? 'grabbing' : (isOwnNote ? 'grab' : 'default'),
                zIndex: draggedNote === user.id ? 10 : 1
              }}
              onMouseDown={isOwnNote ? (e) => onMouseDown(e, user.id) : undefined}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold truncate">{user.nickname}</h3>
                  {!isOwnNote && (
                    <span className="ml-1 text-xs bg-gray-200 px-1 rounded">
                      shared
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  {isOwnNote && colorOptions.map(color => (
                    <button
                      key={color.id}
                      className={`w-4 h-4 rounded-full ${color.bg} border ${color.border} ${user.color === color.id ? 'ring-2 ring-gray-500' : ''}`}
                      onClick={(e) => changeNoteColor(user.id, color.id, e)}
                    />
                  ))}
                  {isOwnNote && (
                    <button
                      className="ml-2 text-red-600 hover:text-red-800"
                      onClick={(e) => deleteUser(user.id, e)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              
              <div className="mb-3 max-h-24 overflow-y-auto">
                <p className="font-medium text-gray-700 text-sm">Prompt:</p>
                <p className="p-2 bg-white bg-opacity-50 rounded text-sm">{user.prompt}</p>
              </div>
              
              <div className="mb-3" onClick={e => e.stopPropagation()}>
                <p className="font-medium text-gray-700 text-sm">Model:</p>
                <div className="relative">
                  <select 
                    className={`w-full p-1 bg-white bg-opacity-50 rounded text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none ${!isOwnNote ? 'cursor-not-allowed opacity-80' : ''}`}
                    value={user.model}
                    onChange={(e) => changeNoteModel(user.id, e.target.value, e)}
                    onClick={e => e.stopPropagation()}
                    onMouseDown={e => e.stopPropagation()}
                    disabled={!isOwnNote}
                  >
                    {availableModels.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="max-h-32 overflow-y-auto">
                <p className="font-medium text-gray-700 text-sm">Response:</p>
                <div className="p-2 bg-white bg-opacity-50 rounded mt-1 text-sm">
                  {responses[user.id] ? (
                    <p>{responses[user.id]}</p>
                  ) : (
                    <p className="text-gray-500 italic">Waiting for response...</p>
                  )}
                </div>
              </div>
              
              {/* Timestamp and attribution */}
              <div className="mt-2 text-xs text-gray-500 flex justify-between">
                <span>
                  {new Date(user.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
                {!isOwnNote && user.id.startsWith('sim_note_') && (
                  <span className="italic">Added by another user</span>
                )}
              </div>
            </div>
          );
        })}
        
        {/* Instructions label - only show when there are no custom notes */}
        {users.length <= 3 && !users.some(user => !user.id.startsWith('example-')) && (
          <div className="absolute top-0 left-0 right-0 flex items-center justify-center text-gray-700 bg-yellow-50 p-3 border-b border-yellow-200">
            <p>👆 Try creating your own sticky note above! You can drag the example stickies to rearrange them.</p>
          </div>
        )}
      </div>
      
      {/* Connection status indicator */}
      <div className="mt-4 text-sm text-gray-600 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
          <span>Connected as {localUsername}</span>
        </div>
        <div>
          <span>{activeUsers.length} active user{activeUsers.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
};

export default MultiUserChatbot;