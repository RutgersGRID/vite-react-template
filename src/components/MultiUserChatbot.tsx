import React, { useState, useEffect } from 'react';

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

  const [users, setUsers] = useState<User[]>(initialExampleUsers);
  const [responses, setResponses] = useState<Response>(initialResponses);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4');
  const [newNickname, setNewNickname] = useState<string>('');
  const [newPrompt, setNewPrompt] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [positions, setPositions] = useState<Positions>(initialPositions);
  const [draggedNote, setDraggedNote] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [formNoteColor, setFormNoteColor] = useState<string>('yellow');

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

  // Get color classes based on color ID
  const getColorClasses = (colorId: string): { bg: string; border: string } => {
    const colorOption = colorOptions.find(c => c.id === colorId) || colorOptions[0];
    return { bg: colorOption.bg, border: colorOption.border };
  };

  // Function to add a new user with their prompt
  const addUser = (e: React.MouseEvent): void => {
    // Stop event propagation to prevent dragging
    e.stopPropagation();
    e.preventDefault();
    
    console.log("Adding new user");
    
    // Validate input
    if (newNickname.trim() === '' || newPrompt.trim() === '') {
      alert("Please enter both nickname and prompt");
      return;
    }
    
    const newUserId = Date.now().toString();
    const newUser: User = {
      id: newUserId,
      nickname: newNickname,
      prompt: newPrompt,
      color: formNoteColor,
      model: selectedModel,
      timestamp: new Date().toISOString()
    };
    
    console.log("Creating new user:", newUser);
    
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
    
    // Generate response for the new user after a short delay
    setTimeout(() => {
      console.log("Generating response for new user");
      generateResponseForUser(newUser);
    }, 100);
  };

  // Generate responses for a specific user
  const generateResponseForUser = (user: User): void => {
    if (!user || !user.id) return;
    
    setIsProcessing(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Generate a mock response based on the model and prompt
      const response = generateMockResponse(user.model, user.prompt);
      
      // Update responses
      setResponses(prev => ({...prev, [user.id]: response}));
      setIsProcessing(false);
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
    
    setUsers(users.filter(user => user.id !== userId));
    
    // Also remove their responses
    const newResponses = {...responses};
    delete newResponses[userId];
    setResponses(newResponses);
    
    // Remove position data
    const newPositions = {...positions};
    delete newPositions[userId];
    setPositions(newPositions);
  };
  
  // Change sticky note color
  const changeNoteColor = (userId: string, colorId: string, e: React.MouseEvent): void => {
    e.stopPropagation();
    
    setUsers(users.map(user => 
      user.id === userId ? {...user, color: colorId} : user
    ));
  };
  
  // Handle drag start
  const handleDragStart = (e: React.MouseEvent, userId: string): void => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get the current position of this note from our state
    const currentPos = positions[userId] || { x: 0, y: 0 };
    
    console.log(`Starting drag for ${userId} from position`, currentPos);
    
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
    setDraggedNote(null);
    setDragState(null);
  };
  
  // Change model for a note
  const changeNoteModel = (userId: string, modelId: string, e: React.ChangeEvent<HTMLSelectElement>): void => {
    e.stopPropagation();
    
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
    }, 100);
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
  };

  return (
    <div className="flex flex-col p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Multi-User Chatbot Comparison</h1>
      
      {/* Instructions */}
      <div className="mb-4 text-gray-600 text-center">
        <p>Add new sticky notes with different prompts. Drag to organize them. Change colors and models on each note.</p>
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
              placeholder="Your nickname"
              className="w-full p-2 bg-white bg-opacity-70 border-0 rounded mb-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={newNickname}
              onChange={(e) => {
                e.stopPropagation();
                setNewNickname(e.target.value);
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
          
          return (
            <div 
              key={user.id} 
              className={`absolute w-64 p-4 rounded-lg shadow-md ${colorOption.bg} ${colorOption.border} border-2`}
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                cursor: draggedNote === user.id ? 'grabbing' : 'grab',
                zIndex: draggedNote === user.id ? 10 : 1
              }}
              onMouseDown={(e) => onMouseDown(e, user.id)}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold truncate">{user.nickname}</h3>
                <div className="flex gap-1">
                  {colorOptions.map(color => (
                    <button
                      key={color.id}
                      className={`w-4 h-4 rounded-full ${color.bg} border ${color.border} ${user.color === color.id ? 'ring-2 ring-gray-500' : ''}`}
                      onClick={(e) => changeNoteColor(user.id, color.id, e)}
                    />
                  ))}
                  <button
                    className="ml-2 text-red-600 hover:text-red-800"
                    onClick={(e) => deleteUser(user.id, e)}
                  >
                    ✕
                  </button>
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
                    className="w-full p-1 bg-white bg-opacity-50 rounded text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                    value={user.model}
                    onChange={(e) => changeNoteModel(user.id, e.target.value, e)}
                    onClick={e => e.stopPropagation()}
                    onMouseDown={e => e.stopPropagation()}
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
            </div>
          );
        })}
        
        {/* Instructions label - only show when there are no custom notes (only example ones) */}
        {users.length <= 3 && !users.some(user => !user.id.startsWith('example-')) && (
          <div className="absolute top-0 left-0 right-0 flex items-center justify-center text-gray-700 bg-yellow-50 p-3 border-b border-yellow-200">
            <p>👆 Try creating your own sticky note above! You can also drag the example stickies below to rearrange them.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiUserChatbot;