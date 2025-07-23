// 'use client';

// import { useState, useEffect } from 'react';

// interface LocationData {
//   _id?: string;
//   city: string;
//   state: string;
//   country: string;
//   ip: string;
//   createdAt?: string;
//   updatedAt?: string;
// }

// interface SessionData {
//   _id?: string;
//   date: string;
//   checkInTime: Date | null;
//   checkOutTime: Date | null;
//   locationId?: string;
// }

// // API configuration
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// export default function HomePage() {
//   const [username] = useState('adam@example.com');
//   const [loggedIn, setLoggedIn] = useState(true);
//   const [checkInTime, setCheckInTime] = useState<Date | null>(null);
//   const [checkOutTime, setCheckOutTime] = useState<Date | null>(null);
//   const [location, setLocation] = useState<LocationData | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [showHistory, setShowHistory] = useState(false);
//   const [sessionHistory, setSessionHistory] = useState<SessionData[]>([]);
//   const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

//   const getTodayKey = () => new Date().toISOString().split('T')[0];

//   // Helper to parse localized time string to Date
//   const parseTimeToDate = (timeStr: string | null, baseDate: Date = new Date()): Date | null => {
//     if (!timeStr) return null;
//     try {
//       const [time, modifier] = timeStr.split(' ');
//       const [hours, minutes] = time.split(':').map(Number);
//       const totalHours = modifier === 'PM' && hours !== 12 ? hours + 12 : hours === 12 && modifier === 'AM' ? 0 : hours;
//       const result = new Date(baseDate);
//       result.setHours(totalHours, minutes, 0, 0);
//       return !isNaN(result.getTime()) ? result : null;
//     } catch (error) {
//       console.error('Error parsing time string:', error, 'Input:', timeStr);
//       return null;
//     }
//   };

//   // API functions for location
//   const createLocation = async (locationData: Omit<LocationData, '_id' | 'createdAt' | 'updatedAt'>): Promise<LocationData | null> => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/location`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(locationData),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to create location');
//       }

//       return await response.json();
//     } catch (error) {
//       console.error('Error creating location:', error);
//       return null;
//     }
//   };

//   const getLocationById = async (id: string): Promise<LocationData | null> => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/location/${id}`);
//       if (!response.ok) {
//         throw new Error('Failed to fetch location');
//       }
//       return await response.json();
//     } catch (error) {
//       console.error('Error fetching location:', error);
//       return null;
//     }
//   };

//   // API functions for sessions
//   const createSession = async (userId: string): Promise<SessionData | null> => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/session/checkin`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ userId }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to create session');
//       }

//       const session = await response.json();
//       console.log('Backend session response:', session); // Debug log
//       if (!session.checkIn || isNaN(new Date(session.checkIn).getTime())) {
//         throw new Error('Invalid check-in time received from backend');
//       }
//       const checkInDate = new Date(session.checkIn);
//       return {
//         _id: session._id,
//         date: checkInDate.toISOString().split('T')[0],
//         checkInTime: checkInDate,
//         checkOutTime: session.checkOut && !isNaN(new Date(session.checkOut).getTime()) ? new Date(session.checkOut) : null,
//         locationId: session.locationId,
//       };
//     } catch (error) {
//       console.error('Error creating session:', error);
//       return null;
//     }
//   };

//   const updateCheckInTime = async (sessionId: string): Promise<SessionData | null> => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/session/checkin/${sessionId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       if (!response.ok) {
//         throw new Error('Failed to update check-in time');
//       }

//       const session = await response.json();
//       console.log('Backend update check-in response:', session); // Debug log
//       if (!session.checkIn || isNaN(new Date(session.checkIn).getTime())) {
//         throw new Error('Invalid check-in time received from backend');
//       }
//       const checkInDate = new Date(session.checkIn);
//       return {
//         _id: session._id,
//         date: checkInDate.toISOString().split('T')[0],
//         checkInTime: checkInDate,
//         checkOutTime: session.checkOut && !isNaN(new Date(session.checkOut).getTime()) ? new Date(session.checkOut) : null,
//         locationId: session.locationId,
//       };
//     } catch (error) {
//       console.error('Error updating check-in time:', error);
//       return null;
//     }
//   };

//   const getSessionsByUserId = async (userId: string): Promise<SessionData[] | null> => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/session?userId=${userId}`);
//       if (!response.ok) {
//         throw new Error('Failed to fetch sessions');
//       }
//       const sessions = await response.json();
//       return sessions.map((session: any) => {
//         const checkInDate = new Date(session.checkIn);
//         const checkOutDate = session.checkOut ? new Date(session.checkOut) : null;
//         return {
//           _id: session._id,
//           date: !isNaN(checkInDate.getTime()) ? checkInDate.toISOString().split('T')[0] : 'Invalid Date',
//           checkInTime: !isNaN(checkInDate.getTime()) ? checkInDate : null,
//           checkOutTime: checkOutDate && !isNaN(checkOutDate.getTime()) ? checkOutDate : null,
//           locationId: session.locationId,
//         };
//       });
//     } catch (error) {
//       console.error('Error fetching sessions:', error);
//       return null;
//     }
//   };

//   // Load user sessions and today's session data
//   useEffect(() => {
//     const loadUserData = async () => {
//       if (!loggedIn) return;

//       try {
//         setIsLoading(true);
        
//         const sessions = await getSessionsByUserId(username);
        
//         if (sessions && sessions.length > 0) {
//           setSessionHistory(sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          
//           const today = getTodayKey();
//           const todaySession = sessions.find(session => session.date === today);
          
//           if (todaySession && todaySession.checkInTime) {
//             setCheckInTime(todaySession.checkInTime instanceof Date && !isNaN(todaySession.checkInTime.getTime()) ? todaySession.checkInTime : null);
//             const newCheckOutTime = todaySession.checkOutTime && !isNaN(todaySession.checkOutTime.getTime()) ? todaySession.checkOutTime : null;
//             setCheckOutTime(newCheckOutTime);
//             setCurrentSessionId(todaySession._id ?? null);
//           } else if (todaySession && todaySession.checkInTime === null) {
//             setCheckInTime(null);
//             setCheckOutTime(null);
//             setCurrentSessionId(todaySession._id ?? null);
//           } else {
//             const parsedCheckIn = todaySession ? parseTimeToDate(todaySession.checkInTime, new Date(today)) : null;
//             if (parsedCheckIn) {
//               setCheckInTime(parsedCheckIn);
//               setCurrentSessionId(todaySession._id ?? null);
//             } else {
//               setCheckInTime(null);
//             }
//             setCheckOutTime(null);
//           }
//         }
        
//         const storedLocation = localStorage.getItem('userLocation');
//         if (storedLocation) {
//           setLocation(JSON.parse(storedLocation));
//         }
//       } catch (error) {
//         console.error('Error loading user data:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadUserData();
//   }, [loggedIn, username]);

//   // Fetch location using IP geolocation and save to backend
//   useEffect(() => {
//     const fetchAndSaveLocation = async () => {
//       if (!loggedIn) return;

//       try {
//         setIsLoading(true);
        
//         const ipResponse = await fetch('https://ipapi.co/json/');
//         if (!ipResponse.ok) {
//           throw new Error('Failed to fetch IP location');
//         }
        
//         const ipData = await ipResponse.json();
        
//         const locationData: Omit<LocationData, '_id' | 'createdAt' | 'updatedAt'> = {
//           city: ipData.city || 'Unknown',
//           state: ipData.region || 'Unknown',
//           country: ipData.country_name || 'Unknown',
//           ip: ipData.ip || 'Unknown',
//         };

//         const today = getTodayKey();
//         const storedLocationId = localStorage.getItem(`locationId_${today}`);
        
//         if (storedLocationId) {
//           const existingLocation = await getLocationById(storedLocationId);
//           if (existingLocation) {
//             setLocation(existingLocation);
//             localStorage.setItem('userLocation', JSON.stringify(existingLocation));
//           }
//         } else {
//           const savedLocation = await createLocation(locationData);
//           if (savedLocation) {
//             setLocation(savedLocation);
//             localStorage.setItem('userLocation', JSON.stringify(savedLocation));
//             localStorage.setItem(`locationId_${today}`, savedLocation._id!);
//           } else {
//             setLocation({
//               city: locationData.city,
//               state: locationData.state,
//               country: locationData.country,
//               ip: locationData.ip,
//             });
//           }
//         }
//       } catch (error) {
//         console.error('Location fetch failed:', error);
        
//         const storedLocation = localStorage.getItem('userLocation');
//         if (storedLocation) {
//           setLocation(JSON.parse(storedLocation));
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     if (!location && loggedIn) {
//       fetchAndSaveLocation();
//     }
//   }, [loggedIn]);

//   const handleCheckIn = async () => {
//     if (!loggedIn) return;

//     try {
//       setIsLoading(true);
//       const now = new Date();
//       let session: SessionData | null;

//       if (currentSessionId && !checkOutTime) {
//         session = await updateCheckInTime(currentSessionId);
//       } else {
//         session = await createSession(username);
//       }

//       if (session && session.checkInTime) {
//         setCheckInTime(session.checkInTime instanceof Date && !isNaN(session.checkInTime.getTime()) ? session.checkInTime : null);
//         const newCheckOutTime = session.checkOutTime && !isNaN(session.checkOutTime.getTime()) ? session.checkOutTime : null;
//         setCheckOutTime(newCheckOutTime);
//         setCurrentSessionId(session._id ?? null);

//         const today = getTodayKey();
//         const newSession: SessionData = {
//           _id: session._id,
//           date: today,
//           checkInTime: now,
//           checkOutTime: null,
//           locationId: location?._id,
//         };

//         setSessionHistory((prev) => {
//           const filtered = prev.filter((s) => s.date !== today);
//           return [newSession, ...filtered].sort(
//             (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
//           );
//         });
//       }
//     } catch (error) {
//       console.error('Error during check-in:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCheckOut = async () => {
//     if (!checkInTime || !loggedIn || !currentSessionId) return;

//     try {
//       setIsLoading(true);
      
//       const response = await fetch(`${API_BASE_URL}/session/checkout/${currentSessionId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       if (!response.ok) {
//         throw new Error('Failed to check out');
//       }

//       const updatedSession = await response.json();
      
//       const checkOutDate = updatedSession.checkOut && !isNaN(new Date(updatedSession.checkOut).getTime())
//         ? new Date(updatedSession.checkOut)
//         : null;
//       setCheckOutTime(checkOutDate);
      
//       const today = getTodayKey();
//       const updatedSessionData: SessionData = {
//         _id: updatedSession._id,
//         date: today,
//         checkInTime: checkInTime,
//         checkOutTime: checkOutTime,
//         locationId: location?._id,
//       };
      
//       setSessionHistory(prev => {
//         const filtered = prev.filter(session => session.date !== today);
//         return [updatedSessionData, ...filtered].sort(
//           (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
//         );
//       });
      
//       setCurrentSessionId(null);
//     } catch (error) {
//       console.error('Error during check-out:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return !isNaN(date.getTime()) ? date.toLocaleDateString('en-US', {
//       weekday: 'short',
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     }) : 'Invalid Date';
//   };

//   const formatTime = (time: Date | null) => {
//     if (!time) return 'Not yet';

//     try {
//       if (isNaN(time.getTime())) {
//         return 'Invalid Date';
//       }
//       return time.toLocaleTimeString('en-US', {
//         hour: '2-digit',
//         minute: '2-digit',
//         hour12: true,
//       });
//     } catch (error) {
//       console.error('Error formatting time:', error, 'Input:', time);
//       return 'Invalid Date';
//     }
//   };

//   const calculateHours = (checkIn: Date | null, checkOut: Date | null) => {
//     if (!checkIn || !checkOut) return 'N/A';

//     try {
//       if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
//         return 'N/A';
//       }

//       const diffMs = checkOut.getTime() - checkIn.getTime();
//       const diffHours = diffMs / (1000 * 60 * 60);
//       return diffHours >= 0 ? `${diffHours.toFixed(1)}h` : 'N/A';
//     } catch (error) {
//       console.error('Error calculating hours:', error);
//       return 'N/A';
//     }
//   };

//   const refreshLocation = async () => {
//     if (!loggedIn) return;

//     setIsLoading(true);
//     const today = getTodayKey();
    
//     localStorage.removeItem('userLocation');
//     localStorage.removeItem(`locationId_${today}`);
//     setLocation(null);
    
//     try {
//       const ipResponse = await fetch('https://ipapi.co/json/');
//       const ipData = await ipResponse.json();
      
//       const locationData: Omit<LocationData, '_id' | 'createdAt' | 'updatedAt'> = {
//         city: ipData.city || 'Unknown',
//         state: ipData.region || 'Unknown',
//         country: ipData.country_name || 'Unknown',
//         ip: ipData.ip || 'Unknown',
//       };

//       const savedLocation = await createLocation(locationData);
//       if (savedLocation) {
//         setLocation(savedLocation);
//         localStorage.setItem('userLocation', JSON.stringify(savedLocation));
//         localStorage.setItem(`locationId_${today}`, savedLocation._id!);
//       }
//     } catch (error) {
//       console.error('Failed to refresh location:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     setLoggedIn(false);
//     setCheckInTime(null);
//     setCheckOutTime(null);
//     setLocation(null);
//     setSessionHistory([]);
//     setCurrentSessionId(null);
    
//     const today = getTodayKey();
//     localStorage.removeItem('userLocation');
//     localStorage.removeItem(`locationId_${today}`);
//   };

//   // Debug log for checkInTime updates with validation
//   useEffect(() => {
//     if (checkInTime && !isNaN(checkInTime.getTime())) {
//       console.log('checkInTime updated:', checkInTime.toISOString());
//     } else {
//       console.log('checkInTime updated: null or invalid');
//     }
//   }, [checkInTime]);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
//       </div>

//       <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-2xl">
//         {loggedIn ? (
//           <>
//             <div className="text-center mb-8">
//               <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
//                 <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                 </svg>
//               </div>
//               <h2 className="text-2xl font-bold text-white mb-2">Welcome back!</h2>
//               <p className="text-blue-200 text-sm">{username}</p>
//             </div>

//             <div className="space-y-4 mb-6">
//               <div className="grid grid-cols-2 gap-4">
//                 <button
//                   onClick={handleCheckIn}
//                   disabled={isLoading}
//                   className={`group relative ${
//                     isLoading
//                       ? 'bg-gray-500 cursor-not-allowed'
//                       : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
//                   } text-white font-semibold py-4 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
//                 >
//                   <span>{isLoading ? 'Loading...' : 'Check In'}</span>
//                 </button>

//                 <button
//                   onClick={handleCheckOut}
//                   disabled={!checkInTime || !currentSessionId || isLoading}
//                   className={`group relative ${
//                     checkInTime && currentSessionId && !isLoading
//                       ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
//                       : 'bg-gray-500 cursor-not-allowed'
//                   } text-white font-semibold py-4 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
//                 >
//                   <span>{isLoading ? 'Loading...' : 'Check Out'}</span>
//                 </button>
//               </div>
//             </div>

//             <div className="space-y-4">
//               <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
//                 <h3 className="text-white font-semibold mb-3">⏱️ Today's Time Tracking</h3>
//                 <div className="space-y-2 text-sm">
//                   <div className="flex justify-between">
//                     <span className="text-blue-200">Check-In:</span>
//                     <span className="text-white font-mono">{formatTime(checkInTime)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-blue-200">Check-Out:</span>
//                     <span className="text-white font-mono">{formatTime(checkOutTime)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-blue-200">Hours:</span>
//                     <span className="text-white font-mono">{calculateHours(checkInTime, checkOutTime)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-blue-200">Status:</span>
//                     <span className={`font-mono ${currentSessionId ? 'text-green-400' : 'text-gray-400'}`}>
//                       {currentSessionId ? 'Checked In' : 'Not Active'}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
//                 <div className="flex justify-between items-center mb-3">
//                   <h3 className="text-white font-semibold">📍 Location Info</h3>
//                   <button
//                     onClick={refreshLocation}
//                     disabled={isLoading}
//                     className="text-blue-300 hover:text-blue-200 transition-colors disabled:opacity-50"
//                   >
//                     <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                     </svg>
//                   </button>
//                 </div>
//                 {isLoading ? (
//                   <span className="text-blue-200 text-sm">Fetching location...</span>
//                 ) : location ? (
//                   <>
//                     <div className="flex justify-between text-sm mb-1">
//                       <span className="text-blue-200">Location:</span>
//                       <span className="text-white">{location.city}, {location.state}</span>
//                     </div>
//                     <div className="flex justify-between text-sm mb-1">
//                       <span className="text-blue-200">Country:</span>
//                       <span className="text-white">{location.country}</span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-blue-200">IP Address:</span>
//                       <span className="text-white font-mono">{location.ip}</span>
//                     </div>
//                     {location._id && (
//                       <div className="flex justify-between text-sm mt-1">
//                         <span className="text-blue-200">ID:</span>
//                         <span className="text-white font-mono text-xs">{location._id}</span>
//                       </div>
//                     )}
//                   </>
//                 ) : (
//                   <span className="text-red-300 text-sm">Failed to fetch location</span>
//                 )}
//               </div>

//               <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
//                 <div className="flex justify-between items-center mb-3">
//                   <h3 className="text-white font-semibold">📊 Attendance History</h3>
//                   <button
//                     onClick={() => setShowHistory(!showHistory)}
//                     className="text-blue-300 hover:text-blue-200 transition-colors"
//                   >
//                     {showHistory ? 'Hide' : 'Show'}
//                   </button>
//                 </div>

//                 {showHistory && (
//                   <div className="space-y-3 max-h-60 overflow-y-auto">
//                     {sessionHistory.length > 0 ? (
//                       sessionHistory.map((session, index) => (
//                         <div key={`${session.date}-${index}`} className="bg-white/5 rounded-xl p-3 border border-white/10">
//                           <div className="flex justify-between items-start mb-2">
//                             <span className="text-white font-medium text-sm">{formatDate(session.date)}</span>
//                             <div className="flex gap-2">
//                               {session.date === getTodayKey() && (
//                                 <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Today</span>
//                               )}
//                               {session.locationId && (
//                                 <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">📍</span>
//                               )}
//                             </div>
//                           </div>
//                           <div className="grid grid-cols-3 gap-2 text-xs">
//                             <div>
//                               <span className="text-blue-200">In: </span>
//                               <span className="text-white font-mono">
//                                 {formatTime(session.checkInTime)}
//                               </span>
//                             </div>
//                             <div>
//                               <span className="text-blue-200">Out: </span>
//                               <span className="text-white font-mono">
//                                 {formatTime(session.checkOutTime)}
//                               </span>
//                             </div>
//                             <div>
//                               <span className="text-blue-200">Hours: </span>
//                               <span className="text-white font-mono">
//                                 {calculateHours(session.checkInTime, session.checkOutTime)}
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                       ))
//                     ) : (
//                       <p className="text-blue-200 text-sm text-center py-4">
//                         {isLoading ? 'Loading history...' : 'No attendance history yet'}
//                       </p>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>

//             <button
//               onClick={handleLogout}
//               className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-2xl transition-all duration-300 border border-white/20"
//             >
//               Logout
//             </button>
//           </>
//         ) : (
//           <div className="text-center space-y-4">
//             <h2 className="text-3xl font-bold text-white">Welcome</h2>
//             <p className="text-blue-200">Sign in to your account</p>
//             <input
//               type="text"
//               placeholder="Email"
//               className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-200"
//               defaultValue={username}
//             />
//             <input
//               type="password"
//               placeholder="Password"
//               className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-200"
//             />
//             <button
//               onClick={() => setLoggedIn(true)}
//               className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 rounded-2xl"
//             >
//               Sign In
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }






// // save this 
// // 'use client';

// // import { useState, useEffect } from 'react';

// // interface LocationData {
// //   _id?: string;
// //   city: string;
// //   state: string;
// //   country: string;
// //   ip: string;
// //   createdAt?: string;
// //   updatedAt?: string;
// // }

// // interface SessionData {
// //   _id?: string;
// //   date: string;
// //   checkInTime: Date | null;
// //   checkOutTime: Date | null;
// //   locationId?: string;
// //   userId?: string;
// //   userName?: string;
// // }

// // interface UserData {
// //   _id?: string;
// //   email: string;
// //   password: string;
// //   role: 'admin' | 'user';
// //   createdAt?: string;
// // }

// // // Mock data for demo purposes (replace with actual API calls)
// // const mockUsers: UserData[] = [
// //   { _id: '1', email: 'admin@company.com', password: 'admin123', role: 'admin' },
// //   { _id: '2', email: 'adam@example.com', password: 'user123', role: 'user' },
// //   { _id: '3', email: 'john@example.com', password: 'user123', role: 'user' },
// // ];

// // const mockSessions: SessionData[] = [
// //   {
// //     _id: '1',
// //     date: '2025-07-19',
// //     checkInTime: new Date('2025-07-19T09:00:00'),
// //     checkOutTime: new Date('2025-07-19T17:00:00'),
// //     userId: '2',
// //     userName: 'adam@example.com'
// //   },
// //   {
// //     _id: '2',
// //     date: '2025-07-18',
// //     checkInTime: new Date('2025-07-18T08:30:00'),
// //     checkOutTime: new Date('2025-07-18T16:30:00'),
// //     userId: '3',
// //     userName: 'john@example.com'
// //   },
// // ];

// // // API configuration
// // const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// // export default function AdminTimeTracker() {
// //   const [currentUser, setCurrentUser] = useState<UserData | null>(null);
// //   const [loginEmail, setLoginEmail] = useState('');
// //   const [loginPassword, setLoginPassword] = useState('');
// //   const [loggedIn, setLoggedIn] = useState(false);
// //   const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'reports'>('dashboard');
  
// //   // User management states
// //   const [users, setUsers] = useState<UserData[]>(mockUsers);
// //   const [newUserEmail, setNewUserEmail] = useState('');
// //   const [newUserPassword, setNewUserPassword] = useState('');
// //   const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('user');
  
// //   // Time tracking states
// //   const [checkInTime, setCheckInTime] = useState<Date | null>(null);
// //   const [checkOutTime, setCheckOutTime] = useState<Date | null>(null);
// //   const [location, setLocation] = useState<LocationData | null>(null);
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [sessionHistory, setSessionHistory] = useState<SessionData[]>(mockSessions);
// //   const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
// //   const [allUserSessions, setAllUserSessions] = useState<SessionData[]>(mockSessions);

// //   const getTodayKey = () => new Date().toISOString().split('T')[0];

// //   // Authentication functions
// //   const handleLogin = async () => {
// //     setIsLoading(true);
    
// //     // Mock authentication - replace with actual API call
// //     const user = mockUsers.find(u => u.email === loginEmail && u.password === loginPassword);
    
// //     if (user) {
// //       setCurrentUser(user);
// //       setLoggedIn(true);
// //       setLoginEmail('');
// //       setLoginPassword('');
      
// //       if (user.role === 'user') {
// //         await loadUserData(user.email);
// //       } else {
// //         await loadAllUserSessions();
// //       }
// //     } else {
// //       alert('Invalid credentials');
// //     }
    
// //     setIsLoading(false);
// //   };

// //   const handleLogout = () => {
// //     setCurrentUser(null);
// //     setLoggedIn(false);
// //     setCheckInTime(null);
// //     setCheckOutTime(null);
// //     setLocation(null);
// //     setSessionHistory([]);
// //     setCurrentSessionId(null);
// //     setActiveTab('dashboard');
// //   };

// //   // Admin functions
// //   const addNewUser = async () => {
// //     if (!newUserEmail || !newUserPassword) {
// //       alert('Please fill in all fields');
// //       return;
// //     }

// //     if (users.find(u => u.email === newUserEmail)) {
// //       alert('User with this email already exists');
// //       return;
// //     }

// //     const newUser: UserData = {
// //       _id: (users.length + 1).toString(),
// //       email: newUserEmail,
// //       password: newUserPassword,
// //       role: newUserRole,
// //       createdAt: new Date().toISOString()
// //     };

// //     setUsers([...users, newUser]);
// //     setNewUserEmail('');
// //     setNewUserPassword('');
// //     setNewUserRole('user');
// //     alert('User added successfully!');
// //   };

// //   const deleteUser = (userId: string) => {
// //     if (window.confirm('Are you sure you want to delete this user?')) {
// //       setUsers(users.filter(u => u._id !== userId));
// //       setAllUserSessions(allUserSessions.filter(s => s.userId !== userId));
// //     }
// //   };

// //   const loadAllUserSessions = async () => {
// //     // Mock data - replace with actual API call
// //     setAllUserSessions(mockSessions);
// //   };

// //   // User functions
// //   const loadUserData = async (userId: string) => {
// //     const userSessions = mockSessions.filter(s => s.userId === currentUser?._id);
// //     setSessionHistory(userSessions);
    
// //     const today = getTodayKey();
// //     const todaySession = userSessions.find(s => s.date === today);
    
// //     if (todaySession) {
// //       setCheckInTime(todaySession.checkInTime);
// //       setCheckOutTime(todaySession.checkOutTime);
// //       setCurrentSessionId(todaySession._id || null);
// //     }
// //   };

// //   const handleCheckIn = async () => {
// //     if (!currentUser) return;
    
// //     setIsLoading(true);
// //     const now = new Date();
    
// //     // Mock check-in - replace with actual API call
// //     const newSession: SessionData = {
// //       _id: (sessionHistory.length + 1).toString(),
// //       date: getTodayKey(),
// //       checkInTime: now,
// //       checkOutTime: null,
// //       userId: currentUser._id,
// //       userName: currentUser.email
// //     };
    
// //     setCheckInTime(now);
// //     setCurrentSessionId(newSession._id || null);
// //     setSessionHistory([newSession, ...sessionHistory]);
// //     setAllUserSessions([newSession, ...allUserSessions]);
    
// //     setIsLoading(false);
// //   };

// //   const handleCheckOut = async () => {
// //     if (!currentUser || !currentSessionId) return;
    
// //     setIsLoading(true);
// //     const now = new Date();
    
//     // Mock check-out - replace with actual API call
//     setCheckOutTime(now);
    
//     const updatedSessions = sessionHistory.map(s => 
//       s._id === currentSessionId ? { ...s, checkOutTime: now } : s
//     );
//     setSessionHistory(updatedSessions);
    
//     const updatedAllSessions = allUserSessions.map(s => 
//       s._id === currentSessionId ? { ...s, checkOutTime: now } : s
//     );
//     setAllUserSessions(updatedAllSessions);
    
//     setCurrentSessionId(null);
//     setIsLoading(false);
//   };

//   // Utility functions
//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       weekday: 'short',
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     });
//   };

//   const formatTime = (time: Date | null) => {
//     if (!time) return 'Not yet';
//     return time.toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true,
//     });
//   };

//   const calculateHours = (checkIn: Date | null, checkOut: Date | null) => {
//     if (!checkIn || !checkOut) return 'N/A';
//     const diffMs = checkOut.getTime() - checkIn.getTime();
//     const diffHours = diffMs / (1000 * 60 * 60);
//     return diffHours >= 0 ? `${diffHours.toFixed(1)}h` : 'N/A';
//   };

//   // Render login screen
//   if (!loggedIn) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
//         <div className="absolute inset-0 overflow-hidden">
//           <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
//           <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
//         </div>

//         <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-md">
//           <div className="text-center space-y-6">
//             <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
//               <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//               </svg>
//             </div>
            
//             <h2 className="text-3xl font-bold text-white">Time Tracker</h2>
//             <p className="text-blue-200">Sign in to your account</p>
            
//             <div className="space-y-4">
//               <input
//                 type="email"
//                 placeholder="Email"
//                 value={loginEmail}
//                 onChange={(e) => setLoginEmail(e.target.value)}
//                 className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//               />
//               <input
//                 type="password"
//                 placeholder="Password"
//                 value={loginPassword}
//                 onChange={(e) => setLoginPassword(e.target.value)}
//                 className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//                 onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
//               />
              
//               <button
//                 onClick={handleLogin}
//                 disabled={isLoading}
//                 className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 rounded-2xl transition-all duration-300"
//               >
//                 {isLoading ? 'Signing In...' : 'Sign In'}
//               </button>
//             </div>
            
//             <div className="text-xs text-blue-300 space-y-1">
//               <p><strong>Demo Credentials:</strong></p>
//               <p>Admin: admin@company.com / admin123</p>
//               <p>User: adam@example.com / user123</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Admin Dashboard
//   if (currentUser?.role === 'admin') {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 mb-6">
//             <div className="flex justify-between items-center">
//               <div>
//                 <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
//                 <p className="text-blue-200">Welcome, {currentUser.email}</p>
//               </div>
//               <button
//                 onClick={handleLogout}
//                 className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-colors"
//               >
//                 Logout
//               </button>
//             </div>
//           </div>

//           {/* Navigation Tabs */}
//           <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-2 mb-6">
//             <div className="flex space-x-2">
//               {[
//                 { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
//                 { id: 'users', label: '👥 Manage Users', icon: '👥' },
//                 { id: 'reports', label: '📋 All Reports', icon: '📋' }
//               ].map((tab) => (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id as any)}
//                   className={`flex-1 py-3 px-4 rounded-2xl font-medium transition-all duration-300 ${
//                     activeTab === tab.id
//                       ? 'bg-blue-500 text-white shadow-lg'
//                       : 'text-blue-200 hover:text-white hover:bg-white/10'
//                   }`}
//                 >
//                   {tab.label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Dashboard Tab */}
//           {activeTab === 'dashboard' && (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
//                 <h3 className="text-white font-semibold mb-4 flex items-center">
//                   👥 Total Users
//                 </h3>
//                 <p className="text-3xl font-bold text-white">{users.filter(u => u.role === 'user').length}</p>
//                 <p className="text-blue-200 text-sm mt-2">Active employees</p>
//               </div>

//               <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
//                 <h3 className="text-white font-semibold mb-4 flex items-center">
//                   ✅ Today's Check-ins
//                 </h3>
//                 <p className="text-3xl font-bold text-green-400">
//                   {allUserSessions.filter(s => s.date === getTodayKey() && s.checkInTime).length}
//                 </p>
//                 <p className="text-blue-200 text-sm mt-2">Users checked in today</p>
//               </div>

//               <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
//                 <h3 className="text-white font-semibold mb-4 flex items-center">
//                   🏃‍♂️ Currently Active
//                 </h3>
//                 <p className="text-3xl font-bold text-yellow-400">
//                   {allUserSessions.filter(s => s.date === getTodayKey() && s.checkInTime && !s.checkOutTime).length}
//                 </p>
//                 <p className="text-blue-200 text-sm mt-2">Users currently working</p>
//               </div>
//             </div>
//           )}

//           {/* Users Management Tab */}
//           {activeTab === 'users' && (
//             <div className="space-y-6">
//               {/* Add New User */}
//               <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
//                 <h3 className="text-white font-semibold mb-4">➕ Add New User</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                   <input
//                     type="email"
//                     placeholder="Email"
//                     value={newUserEmail}
//                     onChange={(e) => setNewUserEmail(e.target.value)}
//                     className="p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200"
//                   />
//                   <input
//                     type="password"
//                     placeholder="Password"
//                     value={newUserPassword}
//                     onChange={(e) => setNewUserPassword(e.target.value)}
//                     className="p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200"
//                   />
//                   <select
//                     value={newUserRole}
//                     onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'user')}
//                     className="p-3 bg-white/10 border border-white/20 rounded-xl text-white"
//                   >
//                     <option value="user" className="bg-gray-800">User</option>
//                     <option value="admin" className="bg-gray-800">Admin</option>
//                   </select>
//                   <button
//                     onClick={addNewUser}
//                     className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors"
//                   >
//                     Add User
//                   </button>
//                 </div>
//               </div>

//               {/* Users List */}
//               <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
//                 <h3 className="text-white font-semibold mb-4">👥 All Users</h3>
//                 <div className="space-y-3">
//                   {users.map((user) => (
//                     <div key={user._id} className="bg-white/5 rounded-xl p-4 flex justify-between items-center">
//                       <div>
//                         <p className="text-white font-medium">{user.email}</p>
//                         <p className="text-blue-200 text-sm">
//                           Role: {user.role} • Created: {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
//                         </p>
//                       </div>
//                       <div className="flex gap-2">
//                         <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                           user.role === 'admin' ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'
//                         }`}>
//                           {user.role}
//                         </span>
//                         {user.email !== currentUser?.email && (
//                           <button
//                             onClick={() => deleteUser(user._id!)}
//                             className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-xs transition-colors"
//                           >
//                             Delete
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Reports Tab */}
//           {activeTab === 'reports' && (
//             <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
//               <h3 className="text-white font-semibold mb-6">📋 All User Sessions</h3>
//               <div className="space-y-3 max-h-96 overflow-y-auto">
//                 {allUserSessions.length > 0 ? (
//                   allUserSessions
//                     .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
//                     .map((session, index) => (
//                       <div key={`${session._id}-${index}`} className="bg-white/5 rounded-xl p-4 border border-white/10">
//                         <div className="flex justify-between items-start mb-3">
//                           <div>
//                             <p className="text-white font-medium">{session.userName}</p>
//                             <p className="text-blue-200 text-sm">{formatDate(session.date)}</p>
//                           </div>
//                           <div className="flex gap-2">
//                             {session.date === getTodayKey() && (
//                               <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Today</span>
//                             )}
//                             {session.checkInTime && !session.checkOutTime && (
//                               <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Active</span>
//                             )}
//                           </div>
//                         </div>
//                         <div className="grid grid-cols-3 gap-4 text-sm">
//                           <div>
//                             <span className="text-blue-200">Check In: </span>
//                             <span className="text-white font-mono">{formatTime(session.checkInTime)}</span>
//                           </div>
//                           <div>
//                             <span className="text-blue-200">Check Out: </span>
//                             <span className="text-white font-mono">{formatTime(session.checkOutTime)}</span>
//                           </div>
//                           <div>
//                             <span className="text-blue-200">Hours: </span>
//                             <span className="text-white font-mono">{calculateHours(session.checkInTime, session.checkOutTime)}</span>
//                           </div>
//                         </div>
//                       </div>
//                     ))
//                 ) : (
//                   <p className="text-blue-200 text-center py-8">No session data available</p>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   }

//   // User Dashboard
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
//       </div>

//       <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-2xl">
//         <div className="text-center mb-8">
//           <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
//             <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//             </svg>
//           </div>
//           <h2 className="text-2xl font-bold text-white mb-2">Welcome back!</h2>
//           <p className="text-blue-200 text-sm">{currentUser?.email}</p>
//         </div>

//         <div className="space-y-4 mb-6">
//           <div className="grid grid-cols-2 gap-4">
//             <button
//               onClick={handleCheckIn}
//               disabled={isLoading || !!currentSessionId}
//               className={`group relative ${
//                 isLoading || !!currentSessionId
//                   ? 'bg-gray-500 cursor-not-allowed'
//                   : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
//               } text-white font-semibold py-4 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
//             >
//               <span>{isLoading ? 'Loading...' : 'Check In'}</span>
//             </button>

//             <button
//               onClick={handleCheckOut}
//               disabled={!currentSessionId || isLoading}
//               className={`group relative ${
//                 currentSessionId && !isLoading
//                   ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
//                   : 'bg-gray-500 cursor-not-allowed'
//               } text-white font-semibold py-4 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
//             >
//               <span>{isLoading ? 'Loading...' : 'Check Out'}</span>
//             </button>
//           </div>
//         </div>

//         <div className="space-y-4">
//           <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
//             <h3 className="text-white font-semibold mb-3">⏱️ Today's Time Tracking</h3>
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-blue-200">Check-In:</span>
//                 <span className="text-white font-mono">{formatTime(checkInTime)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-blue-200">Check-Out:</span>
//                 <span className="text-white font-mono">{formatTime(checkOutTime)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-blue-200">Hours:</span>
//                 <span className="text-white font-mono">{calculateHours(checkInTime, checkOutTime)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-blue-200">Status:</span>
//                 <span className={`font-mono ${currentSessionId ? 'text-green-400' : 'text-gray-400'}`}>
//                   {currentSessionId ? 'Checked In' : 'Not Active'}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
//             <h3 className="text-white font-semibold mb-3">📊 My History</h3>
//             <div className="space-y-2 max-h-40 overflow-y-auto">
//               {sessionHistory.length > 0 ? (
//                 sessionHistory.map((session, index) => (
//                   <div key={`${session.date}-${index}`} className="bg-white/5 rounded-xl p-3 border border-white/10">
//                     <div className="flex justify-between items-center mb-2">
//                       <span className="text-white font-medium text-sm">{formatDate(session.date)}</span>
//                       {session.date === getTodayKey() && (
//                         <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Today</span>
//                       )}
//                     </div>
//                     <div className="grid grid-cols-3 gap-2 text-xs">
//                       <div>
//                         <span className="text-blue-200">In: </span>
//                         <span className="text-white font-mono">{formatTime(session.checkInTime)}</span>
//                       </div>
//                       <div>
//                         <span className="text-blue-200">Out: </span>
//                         <span className="text-white font-mono">{formatTime(session.checkOutTime)}</span>
//                       </div>
//                       <div>
//                         <span className="text-blue-200">Hours: </span>
//                         <span className="text-white font-mono">{calculateHours(session.checkInTime, session.checkOutTime)}</span>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-blue-200 text-sm text-center py-4">No history available</p>
//               )}
//             </div>
//           </div>
//         </div>

//         <button
//           onClick={handleLogout}
//           className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-2xl transition-all duration-300 border border-white/20"
//         >
//           Logout
//         </button>
//       </div>
//     </div>
//   );
// }

// 'use client';

// import { useState, useEffect } from 'react';

// interface LocationData {
//   _id?: string;
//   city: string;
//   state: string;
//   country: string;
//   ip: string;
//   createdAt?: string;
//   updatedAt?: string;
// }

// interface SessionData {
//   _id?: string;
//   date: string;
//   checkInTime: Date | null;
//   checkOutTime: Date | null;
//   locationId?: string;
//   userId?: string;
//   userName?: string;
// }

// interface UserData {
//   _id?: string;
//   username?: string;
//   email: string;
//   password?: string;
//   role: 'Admin' | 'User';
//   createdAt?: string;
// }

// interface AuthResponse {
//   message: string;
//   token: string;
//   user: {
//     id: string;
//     username: string;
//     email: string;
//     role: 'Admin' | 'User';
//   };
// }

// // Mock data for demo purposes (replace with actual API calls)
// const mockUsers: UserData[] = [
//   { _id: '1', username: 'Admin User', email: 'admin@company.com', role: 'Admin' },
//   { _id: '2', username: 'Adam Smith', email: 'adam@example.com', role: 'User' },
//   { _id: '3', username: 'John Doe', email: 'john@example.com', role: 'User' },
// ];

// const mockSessions: SessionData[] = [
//   {
//     _id: '1',
//     date: '2025-07-19',
//     checkInTime: new Date('2025-07-19T09:00:00'),
//     checkOutTime: new Date('2025-07-19T17:00:00'),
//     userId: '2',
//     userName: 'adam@example.com'
//   },
//   {
//     _id: '2',
//     date: '2025-07-18',
//     checkInTime: new Date('2025-07-18T08:30:00'),
//     checkOutTime: new Date('2025-07-18T16:30:00'),
//     userId: '3',
//     userName: 'john@example.com'
//   },
// ];

// // API configuration
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// export default function AdminTimeTracker() {
//   const [currentUser, setCurrentUser] = useState<UserData | null>(null);
//   const [authToken, setAuthToken] = useState<string | null>(null);
//   const [loginEmail, setLoginEmail] = useState('');
//   const [loginPassword, setLoginPassword] = useState('');
//   const [loginRole, setLoginRole] = useState<'Admin' | 'User'>('User');
//   const [loggedIn, setLoggedIn] = useState(false);
//   const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'reports'>('dashboard');
//   const [isSignupMode, setIsSignupMode] = useState(false);
  
//   // Signup states
//   const [signupUsername, setSignupUsername] = useState('');
//   const [signupEmail, setSignupEmail] = useState('');
//   const [signupPassword, setSignupPassword] = useState('');
//   const [signupRole, setSignupRole] = useState<'Admin' | 'User'>('User');
  
//   // User management states
//   const [users, setUsers] = useState<UserData[]>(mockUsers);
//   const [newUserUsername, setNewUserUsername] = useState('');
//   const [newUserEmail, setNewUserEmail] = useState('');
//   const [newUserPassword, setNewUserPassword] = useState('');
//   const [newUserRole, setNewUserRole] = useState<'Admin' | 'User'>('User');
  
//   // Time tracking states
//   const [checkInTime, setCheckInTime] = useState<Date | null>(null);
//   const [checkOutTime, setCheckOutTime] = useState<Date | null>(null);
//   const [location, setLocation] = useState<LocationData | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [sessionHistory, setSessionHistory] = useState<SessionData[]>(mockSessions);
//   const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
//   const [allUserSessions, setAllUserSessions] = useState<SessionData[]>(mockSessions);

//   const getTodayKey = () => new Date().toISOString().split('T')[0];

//   // Check for saved token on component mount
//   useEffect(() => {
//     const savedToken = localStorage.getItem('authToken');
//     const savedUser = localStorage.getItem('currentUser');
    
//     if (savedToken && savedUser) {
//       setAuthToken(savedToken);
//       setCurrentUser(JSON.parse(savedUser));
//       setLoggedIn(true);
      
//       const user = JSON.parse(savedUser);
//       if (user.role === 'User') {
//         loadUserData(user.email);
//       } else {
//         loadAllUserSessions();
//       }
//     }
//   }, []);

//   // Authentication functions
//   const handleLogin = async () => {
//     setIsLoading(true);
    
//     try {
//       const response = await fetch(`${API_BASE_URL}/access-control/login`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           email: loginEmail,
//           password: loginPassword,
//           role: loginRole,
//         }),
//       });

//       const data: AuthResponse = await response.json();

//       if (response.ok) {
//         const userData: UserData = {
//           _id: data.user.id,
//           username: data.user.username,
//           email: data.user.email,
//           role: data.user.role,
//         };

//         setCurrentUser(userData);
//         setAuthToken(data.token);
//         setLoggedIn(true);
//         setLoginEmail('');
//         setLoginPassword('');
        
//         // Save to localStorage
//         localStorage.setItem('authToken', data.token);
//         localStorage.setItem('currentUser', JSON.stringify(userData));
        
//         if (userData.role === 'User') {
//           await loadUserData(userData.email);
//         } else {
//           await loadAllUserSessions();
//         }
//       } else {
//         alert(data.message || 'Login failed');
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       // Fallback to mock authentication for demo
//       const user = mockUsers.find(u => u.email === loginEmail && u.role === loginRole);
      
//       if (user) {
//         setCurrentUser(user);
//         setLoggedIn(true);
//         setLoginEmail('');
//         setLoginPassword('');
        
//         if (user.role === 'User') {
//           await loadUserData(user.email);
//         } else {
//           await loadAllUserSessions();
//         }
//       } else {
//         alert('Invalid credentials');
//       }
//     }
    
//     setIsLoading(false);
//   };

//   const handleSignup = async () => {
//     setIsLoading(true);
    
//     try {
//       const response = await fetch(`${API_BASE_URL}/access-control/signup`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           username: signupUsername,
//           email: signupEmail,
//           password: signupPassword,
//           role: signupRole,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         alert('Signup successful! You can now login.');
//         setIsSignupMode(false);
//         setSignupUsername('');
//         setSignupEmail('');
//         setSignupPassword('');
//         setSignupRole('User');
//       } else {
//         alert(data.message || 'Signup failed');
//       }
//     } catch (error) {
//       console.error('Signup error:', error);
//       alert('Signup failed. Please try again.');
//     }
    
//     setIsLoading(false);
//   };

//   const handleLogout = () => {
//     setCurrentUser(null);
//     setAuthToken(null);
//     setLoggedIn(false);
//     setCheckInTime(null);
//     setCheckOutTime(null);
//     setLocation(null);
//     setSessionHistory([]);
//     setCurrentSessionId(null);
//     setActiveTab('dashboard');
    
//     // Clear localStorage
//     localStorage.removeItem('authToken');
//     localStorage.removeItem('currentUser');
//   };

//   // Admin functions
//   const addNewUser = async () => {
//     if (!newUserUsername || !newUserEmail || !newUserPassword) {
//       alert('Please fill in all fields');
//       return;
//     }

//     if (users.find(u => u.email === newUserEmail)) {
//       alert('User with this email already exists');
//       return;
//     }

//     try {
//       const response = await fetch(`${API_BASE_URL}/access-control/signup`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${authToken}`,
//         },
//         body: JSON.stringify({
//           username: newUserUsername,
//           email: newUserEmail,
//           password: newUserPassword,
//           role: newUserRole,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         const newUser: UserData = {
//           _id: data.user.id,
//           username: newUserUsername,
//           email: newUserEmail,
//           role: newUserRole,
//           createdAt: new Date().toISOString()
//         };

//         setUsers([...users, newUser]);
//         setNewUserUsername('');
//         setNewUserEmail('');
//         setNewUserPassword('');
//         setNewUserRole('User');
//         alert('User added successfully!');
//       } else {
//         alert(data.message || 'Failed to add user');
//       }
//     } catch (error) {
//       console.error('Add user error:', error);
//       // Fallback to mock data for demo
//       const newUser: UserData = {
//         _id: (users.length + 1).toString(),
//         username: newUserUsername,
//         email: newUserEmail,
//         role: newUserRole,
//         createdAt: new Date().toISOString()
//       };

//       setUsers([...users, newUser]);
//       setNewUserUsername('');
//       setNewUserEmail('');
//       setNewUserPassword('');
//       setNewUserRole('User');
//       alert('User added successfully!');
//     }
//   };

//   const deleteUser = (userId: string) => {
//     if (window.confirm('Are you sure you want to delete this user?')) {
//       setUsers(users.filter(u => u._id !== userId));
//       setAllUserSessions(allUserSessions.filter(s => s.userId !== userId));
//     }
//   };

//   const loadAllUserSessions = async () => {
//     try {
//       // Replace with actual API call
//       // const response = await fetch(`${API_BASE_URL}/sessions`, {
//       //   headers: { 'Authorization': `Bearer ${authToken}` }
//       // });
//       // const sessions = await response.json();
//       setAllUserSessions(mockSessions);
//     } catch (error) {
//       console.error('Load sessions error:', error);
//       setAllUserSessions(mockSessions);
//     }
//   };

//   // User functions
//   const loadUserData = async (userId: string) => {
//     const userSessions = mockSessions.filter(s => s.userId === currentUser?._id);
//     setSessionHistory(userSessions);
    
//     const today = getTodayKey();
//     const todaySession = userSessions.find(s => s.date === today);
    
//     if (todaySession) {
//       setCheckInTime(todaySession.checkInTime);
//       setCheckOutTime(todaySession.checkOutTime);
//       setCurrentSessionId(todaySession._id || null);
//     }
//   };

//   const handleCheckIn = async () => {
//     if (!currentUser) return;
    
//     setIsLoading(true);
//     const now = new Date();
    
//     try {
//       // Replace with actual API call
//       // const response = await fetch(`${API_BASE_URL}/sessions/checkin`, {
//       //   method: 'POST',
//       //   headers: {
//       //     'Content-Type': 'application/json',
//       //     'Authorization': `Bearer ${authToken}`
//       //   },
//       //   body: JSON.stringify({ userId: currentUser._id })
//       // });
      
//       const newSession: SessionData = {
//         _id: (sessionHistory.length + 1).toString(),
//         date: getTodayKey(),
//         checkInTime: now,
//         checkOutTime: null,
//         userId: currentUser._id,
//         userName: currentUser.email
//       };
      
//       setCheckInTime(now);
//       setCurrentSessionId(newSession._id || null);
//       setSessionHistory([newSession, ...sessionHistory]);
//       setAllUserSessions([newSession, ...allUserSessions]);
//     } catch (error) {
//       console.error('Check-in error:', error);
//     }
    
//     setIsLoading(false);
//   };

//   const handleCheckOut = async () => {
//     if (!currentUser || !currentSessionId) return;
    
//     setIsLoading(true);
//     const now = new Date();
    
//     try {
//       // Replace with actual API call
//       // const response = await fetch(`${API_BASE_URL}/sessions/checkout`, {
//       //   method: 'PUT',
//       //   headers: {
//       //     'Content-Type': 'application/json',
//       //     'Authorization': `Bearer ${authToken}`
//       //   },
//       //   body: JSON.stringify({ sessionId: currentSessionId })
//       // });
      
//       setCheckOutTime(now);
      
//       const updatedSessions = sessionHistory.map(s => 
//         s._id === currentSessionId ? { ...s, checkOutTime: now } : s
//       );
//       setSessionHistory(updatedSessions);
      
//       const updatedAllSessions = allUserSessions.map(s => 
//         s._id === currentSessionId ? { ...s, checkOutTime: now } : s
//       );
//       setAllUserSessions(updatedAllSessions);
      
//       setCurrentSessionId(null);
//     } catch (error) {
//       console.error('Check-out error:', error);
//     }
    
//     setIsLoading(false);
//   };

//   // Utility functions
//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       weekday: 'short',
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     });
//   };

//   const formatTime = (time: Date | null) => {
//     if (!time) return 'Not yet';
//     return time.toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true,
//     });
//   };

//   const calculateHours = (checkIn: Date | null, checkOut: Date | null) => {
//     if (!checkIn || !checkOut) return 'N/A';
//     const diffMs = checkOut.getTime() - checkIn.getTime();
//     const diffHours = diffMs / (1000 * 60 * 60);
//     return diffHours >= 0 ? `${diffHours.toFixed(1)}h` : 'N/A';
//   };

//   // Render login/signup screen
//   if (!loggedIn) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
//         <div className="absolute inset-0 overflow-hidden">
//           <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
//           <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
//         </div>

//         <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-md">
//           <div className="text-center space-y-6">
//             <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
//               <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//               </svg>
//             </div>
            
//             <h2 className="text-3xl font-bold text-white">Time Tracker</h2>
//             <p className="text-blue-200">{isSignupMode ? 'Create your account' : 'Sign in to your account'}</p>
            
//             <div className="space-y-4">
//               {isSignupMode && (
//                 <input
//                   type="text"
//                   placeholder="Username"
//                   value={signupUsername}
//                   onChange={(e) => setSignupUsername(e.target.value)}
//                   className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//                 />
//               )}
              
//               <input
//                 type="email"
//                 placeholder="Email"
//                 value={isSignupMode ? signupEmail : loginEmail}
//                 onChange={(e) => isSignupMode ? setSignupEmail(e.target.value) : setLoginEmail(e.target.value)}
//                 className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//               />
              
//               <input
//                 type="password"
//                 placeholder="Password"
//                 value={isSignupMode ? signupPassword : loginPassword}
//                 onChange={(e) => isSignupMode ? setSignupPassword(e.target.value) : setLoginPassword(e.target.value)}
//                 className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//                 onKeyPress={(e) => e.key === 'Enter' && (isSignupMode ? handleSignup() : handleLogin())}
//               />
              
//               <select
//                 value={isSignupMode ? signupRole : loginRole}
//                 onChange={(e) => isSignupMode ? setSignupRole(e.target.value as 'Admin' | 'User') : setLoginRole(e.target.value as 'Admin' | 'User')}
//                 className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//               >
//                 <option value="User" className="bg-gray-800">User</option>
//                 <option value="Admin" className="bg-gray-800">Admin</option>
//               </select>
              
//               <button
//                 onClick={isSignupMode ? handleSignup : handleLogin}
//                 disabled={isLoading}
//                 className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 rounded-2xl transition-all duration-300"
//               >
//                 {isLoading ? (isSignupMode ? 'Creating Account...' : 'Signing In...') : (isSignupMode ? 'Sign Up' : 'Sign In')}
//               </button>
              
//               <button
//                 onClick={() => setIsSignupMode(!isSignupMode)}
//                 className="w-full text-blue-300 hover:text-white font-medium transition-colors"
//               >
//                 {isSignupMode ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
//               </button>
//             </div>
            
//             <div className="text-xs text-blue-300 space-y-1">
//               <p><strong>Demo Credentials:</strong></p>
//               <p>Admin: admin@company.com / admin123</p>
//               <p>User: adam@example.com / user123</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Admin Dashboard
//   if (currentUser?.role === 'Admin') {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 mb-6">
//             <div className="flex justify-between items-center">
//               <div>
//                 <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
//                 <p className="text-blue-200">Welcome, {currentUser.username || currentUser.email}</p>
//               </div>
//               <button
//                 onClick={handleLogout}
//                 className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-colors"
//               >
//                 Logout
//               </button>
//             </div>
//           </div>

//           {/* Navigation Tabs */}
//           <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-2 mb-6">
//             <div className="flex space-x-2">
//               {[
//                 { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
//                 { id: 'users', label: '👥 Manage Users', icon: '👥' },
//                 { id: 'reports', label: '📋 All Reports', icon: '📋' }
//               ].map((tab) => (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id as any)}
//                   className={`flex-1 py-3 px-4 rounded-2xl font-medium transition-all duration-300 ${
//                     activeTab === tab.id
//                       ? 'bg-blue-500 text-white shadow-lg'
//                       : 'text-blue-200 hover:text-white hover:bg-white/10'
//                   }`}
//                 >
//                   {tab.label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Dashboard Tab */}
//           {activeTab === 'dashboard' && (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
//                 <h3 className="text-white font-semibold mb-4 flex items-center">
//                   👥 Total Users
//                 </h3>
//                 <p className="text-3xl font-bold text-white">{users.filter(u => u.role === 'User').length}</p>
//                 <p className="text-blue-200 text-sm mt-2">Active employees</p>
//               </div>

//               <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
//                 <h3 className="text-white font-semibold mb-4 flex items-center">
//                   ✅ Today's Check-ins
//                 </h3>
//                 <p className="text-3xl font-bold text-green-400">
//                   {allUserSessions.filter(s => s.date === getTodayKey() && s.checkInTime).length}
//                 </p>
//                 <p className="text-blue-200 text-sm mt-2">Users checked in today</p>
//               </div>

//               <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
//                 <h3 className="text-white font-semibold mb-4 flex items-center">
//                   🏃‍♂️ Currently Active
//                 </h3>
//                 <p className="text-3xl font-bold text-yellow-400">
//                   {allUserSessions.filter(s => s.date === getTodayKey() && s.checkInTime && !s.checkOutTime).length}
//                 </p>
//                 <p className="text-blue-200 text-sm mt-2">Users currently working</p>
//               </div>
//             </div>
//           )}

//           {/* Users Management Tab */}
//           {activeTab === 'users' && (
//             <div className="space-y-6">
//               {/* Add New User */}
//               <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
//                 <h3 className="text-white font-semibold mb-4">➕ Add New User</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//                   <input
//                     type="text"
//                     placeholder="Username"
//                     value={newUserUsername}
//                     onChange={(e) => setNewUserUsername(e.target.value)}
//                     className="p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200"
//                   />
//                   <input
//                     type="email"
//                     placeholder="Email"
//                     value={newUserEmail}
//                     onChange={(e) => setNewUserEmail(e.target.value)}
//                     className="p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200"
//                   />
//                   <input
//                     type="password"
//                     placeholder="Password"
//                     value={newUserPassword}
//                     onChange={(e) => setNewUserPassword(e.target.value)}
//                     className="p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200"
//                   />
//                   <select
//                     value={newUserRole}
//                     onChange={(e) => setNewUserRole(e.target.value as 'Admin' | 'User')}
//                     className="p-3 bg-white/10 border border-white/20 rounded-xl text-white"
//                   >
//                     <option value="User" className="bg-gray-800">User</option>
//                     <option value="Admin" className="bg-gray-800">Admin</option>
//                   </select>
//                   <button
//                     onClick={addNewUser}
//                     className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors"
//                   >
//                     Add User
//                   </button>
//                 </div>
//               </div>

//               {/* Users List */}
//               <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
//                 <h3 className="text-white font-semibold mb-4">👥 All Users</h3>
//                 <div className="space-y-3">
//                   {users.map((user) => (
//                     <div key={user._id} className="bg-white/5 rounded-xl p-4 flex justify-between items-center">
//                       <div>
//                         <p className="text-white font-medium">{user.username || user.email}</p>
//                         <p className="text-blue-200 text-sm">
//                           {user.email} • Role: {user.role} • Created: {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
//                         </p>
//                       </div>
//                       <div className="flex gap-2">
//                         <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                           user.role === 'Admin' ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'
//                         }`}>
//                           {user.role}
//                         </span>
//                         {user.email !== currentUser?.email && (
//                           <button
//                             onClick={() => deleteUser(user._id!)}
//                             className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-xs transition-colors"
//                           >
//                             Delete
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Reports Tab */}
//           {activeTab === 'reports' && (
//             <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
//               <h3 className="text-white font-semibold mb-6">📋 All User Sessions</h3>
//               <div className="space-y-3 max-h-96 overflow-y-auto">
//                 {allUserSessions.length > 0 ? (
//                   allUserSessions
//                     .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
//                     .map((session, index) => (
//                       <div key={`${session._id}-${index}`} className="bg-white/5 rounded-xl p-4 border border-white/10">
//                         <div className="flex justify-between items-start mb-3">
//                           <div>
//                             <p className="text-white font-medium">{session.userName}</p>
//                             <p className="text-blue-200 text-sm">{formatDate(session.date)}</p>
//                           </div>
//                           <div className="flex gap-2">
//                             {session.date === getTodayKey() && (
//                               <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Today</span>
//                             )}
//                             {session.checkInTime && !session.checkOutTime && (
//                               <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Active</span>
//                             )}
//                           </div>
//                         </div>
//                         <div className="grid grid-cols-3 gap-4 text-sm">
//                           <div>
//                             <span className="text-blue-200">Check In: </span>
//        <span className="text-white font-mono">{formatTime(session.checkInTime)}</span>
//                            </div>
//                           <div>
//                             <span className="text-blue-200">Check Out: </span>
//                             <span className="text-white font-mono">{formatTime(session.checkOutTime)}</span>
//                           </div>
//                           <div>
//                            <span className="text-blue-200">Hours: </span>
//                             <span className="text-white font-mono">{calculateHours(session.checkInTime, session.checkOutTime)}</span>
//                         </div>
//                         </div>
//                       </div>
//                     ))
//                 ) : (
//                   <p className="text-blue-200 text-center py-8">No session data available</p>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   }

//   // User Dashboard
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
//       </div>

//       <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-2xl">
//         <div className="text-center mb-8">
//           <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
//             <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//             </svg>
//           </div>
//           <h2 className="text-2xl font-bold text-white mb-2">Welcome back!</h2>
//           <p className="text-blue-200 text-sm">{currentUser?.email}</p>
//         </div>

//         <div className="space-y-4 mb-6">
//           <div className="grid grid-cols-2 gap-4">
//             <button
//               onClick={handleCheckIn}
//               disabled={isLoading || !!currentSessionId}
//               className={`group relative ${
//                 isLoading || !!currentSessionId
//                   ? 'bg-gray-500 cursor-not-allowed'
//                   : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
//               } text-white font-semibold py-4 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
//             >
//               <span>{isLoading ? 'Loading...' : 'Check In'}</span>
//             </button>

//             <button
//               onClick={handleCheckOut}
//               disabled={!currentSessionId || isLoading}
//               className={`group relative ${
//                 currentSessionId && !isLoading
//                   ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
//                   : 'bg-gray-500 cursor-not-allowed'
//               } text-white font-semibold py-4 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
//             >
//               <span>{isLoading ? 'Loading...' : 'Check Out'}</span>
//             </button>
//           </div>
//         </div>

//         <div className="space-y-4">
//           <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
//             <h3 className="text-white font-semibold mb-3">⏱️ Today's Time Tracking</h3>
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-blue-200">Check-In:</span>
//                 <span className="text-white font-mono">{formatTime(checkInTime)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-blue-200">Check-Out:</span>
//                 <span className="text-white font-mono">{formatTime(checkOutTime)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-blue-200">Hours:</span>
//                 <span className="text-white font-mono">{calculateHours(checkInTime, checkOutTime)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-blue-200">Status:</span>
//                 <span className={`font-mono ${currentSessionId ? 'text-green-400' : 'text-gray-400'}`}>
//                   {currentSessionId ? 'Checked In' : 'Not Active'}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
//             <h3 className="text-white font-semibold mb-3">📊 My History</h3>
//             <div className="space-y-2 max-h-40 overflow-y-auto">
//               {sessionHistory.length > 0 ? (
//                 sessionHistory.map((session, index) => (
//                   <div key={`${session.date}-${index}`} className="bg-white/5 rounded-xl p-3 border border-white/10">
//                     <div className="flex justify-between items-center mb-2">
//                       <span className="text-white font-medium text-sm">{formatDate(session.date)}</span>
//                       {session.date === getTodayKey() && (
//                         <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Today</span>
//                       )}
//                     </div>
//                     <div className="grid grid-cols-3 gap-2 text-xs">
//                       <div>
//                         <span className="text-blue-200">In: </span>
//                         <span className="text-white font-mono">{formatTime(session.checkInTime)}</span>
//                       </div>
//                       <div>
//                         <span className="text-blue-200">Out: </span>
//                         <span className="text-white font-mono">{formatTime(session.checkOutTime)}</span>
//                       </div>
//                       <div>
//                         <span className="text-blue-200">Hours: </span>
//                         <span className="text-white font-mono">{calculateHours(session.checkInTime, session.checkOutTime)}</span>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-blue-200 text-sm text-center py-4">No history available</p>
//               )}
//             </div>
//           </div>
//         </div>

//         <button
//           onClick={handleLogout}
//           className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-2xl transition-all duration-300 border border-white/20"
//         >
//           Logout
//         </button>
//       </div>
//     </div>
//   );
// }





// 'use client';

// import { useState, useEffect } from 'react';

// interface LocationData {
//   _id?: string;
//   city: string;
//   state: string;
//   country: string;
//   ip: string;
//   createdAt?: string;
//   updatedAt?: string;
// }

// interface SessionData {
//   _id: string;
//   userId: string;
//   checkIn: Date; // Ensure checkIn is a Date object
//   checkOut: Date | null; // Ensure checkOut is a Date or null
//   createdAt?: string;
//   userName?: string; // Added for display purposes, optional
// }

// interface UserData {
//   _id: string;
//   username: string;
//   email: string;
//   role: 'Admin' | 'User';
//   createdAt?: string;
// }

// interface AuthResponse {
//   message: string;
//   token: string;
//   user: {
//     id: string;
//     username: string;
//     email: string;
//     role: 'Admin' | 'User';
//   };
// }

// // API configuration
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// export default function AdminTimeTracker() {
//   const [currentUser, setCurrentUser] = useState<UserData | null>(null);
//   const [authToken, setAuthToken] = useState<string | null>(null);
//   const [loginEmail, setLoginEmail] = useState('');
//   const [loginPassword, setLoginPassword] = useState('');
//   const [loginRole, setLoginRole] = useState<'Admin' | 'User'>('User');
//   const [loggedIn, setLoggedIn] = useState(false);
//   const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'reports'>('dashboard');
//   const [isSignupMode, setIsSignupMode] = useState(false);

//   // Signup states
//   const [signupUsername, setSignupUsername] = useState('');
//   const [signupEmail, setSignupEmail] = useState('');
//   const [signupPassword, setSignupPassword] = useState('');
//   const [signupRole, setSignupRole] = useState<'Admin' | 'User'>('User');

//   // User management states
//   const [users, setUsers] = useState<UserData[]>([]);
//   const [newUserUsername, setNewUserUsername] = useState('');
//   const [newUserEmail, setNewUserEmail] = useState('');
//   const [newUserPassword, setNewUserPassword] = useState('');
//   const [newUserRole, setNewUserRole] = useState<'Admin' | 'User'>('User');

//   // Time tracking states
//   const [checkInTime, setCheckInTime] = useState<Date | null>(null);
//   const [checkOutTime, setCheckOutTime] = useState<Date | null>(null);
//   const [location, setLocation] = useState<LocationData | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [sessionHistory, setSessionHistory] = useState<SessionData[]>([]);
//   const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
//   const [allUserSessions, setAllUserSessions] = useState<SessionData[]>([]);

//   const getTodayKey = () => new Date().toISOString().split('T')[0];

//   // Check for saved token on component mount
//   useEffect(() => {
//     const savedToken = localStorage.getItem('authToken');
//     const savedUser = localStorage.getItem('currentUser');

//     if (savedToken && savedUser) {
//       setAuthToken(savedToken);
//       setCurrentUser(JSON.parse(savedUser));
//       setLoggedIn(true);

//       const user = JSON.parse(savedUser);
//       if (user.role === 'User') {
//         loadUserData(user.id);
//       } else {
//         loadAllUserSessions();
//         loadAllUsers();
//       }
//     }
//   }, []);

//   // Fetch all users (Admin only)
//   const loadAllUsers = async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/access-control/users`, {
//         headers: {
//           'Authorization': `Bearer ${authToken}`,
//         },
//       });
//       const data = await response.json();
//       if (response.ok) {
//         setUsers(data);
//       } else {
//         console.error('Failed to fetch users:', data.message);
//       }
//     } catch (error) {
//       console.error('Load users error:', error);
//     }
//   };

//   // Authentication functions
//   const handleLogin = async () => {
//     setIsLoading(true);

//     try {
//       const response = await fetch(`${API_BASE_URL}/access-control/login`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           email: loginEmail,
//           password: loginPassword,
//           role: loginRole,
//         }),
//       });

//       const data: AuthResponse = await response.json();

//       if (response.ok) {
//         const userData: UserData = {
//           _id: data.user.id,
//           username: data.user.username,
//           email: data.user.email,
//           role: data.user.role,
//         };

//         setCurrentUser(userData);
//         setAuthToken(data.token);
//         setLoggedIn(true);
//         setLoginEmail('');
//         setLoginPassword('');

//         // Save to localStorage
//         localStorage.setItem('authToken', data.token);
//         localStorage.setItem('currentUser', JSON.stringify(userData));

//         if (userData.role === 'User') {
//           await loadUserData(userData._id);
//         } else {
//           await loadAllUserSessions();
//           await loadAllUsers();
//         }
//       } else {
//         alert(data.message || 'Login failed');
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       alert('Login failed. Please try again.');
//     }

//     setIsLoading(false);
//   };

//   const handleSignup = async () => {
//     setIsLoading(true);

//     try {
//       const response = await fetch(`${API_BASE_URL}/access-control/signup`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           username: signupUsername,
//           email: signupEmail,
//           password: signupPassword,
//           role: signupRole,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         alert('Signup successful! You can now login.');
//         setIsSignupMode(false);
//         setSignupUsername('');
//         setSignupEmail('');
//         setSignupPassword('');
//         setSignupRole('User');
//       } else {
//         alert(data.message || 'Signup failed');
//       }
//     } catch (error) {
//       console.error('Signup error:', error);
//       alert('Signup failed. Please try again.');
//     }

//     setIsLoading(false);
//   };

//   const handleLogout = () => {
//     setCurrentUser(null);
//     setAuthToken(null);
//     setLoggedIn(false);
//     setCheckInTime(null);
//     setCheckOutTime(null);
//     setLocation(null);
//     setSessionHistory([]);
//     setCurrentSessionId(null);
//     setActiveTab('dashboard');
//     setUsers([]);
//     setAllUserSessions([]);

//     // Clear localStorage
//     localStorage.removeItem('authToken');
//     localStorage.removeItem('currentUser');
//   };

//   // Admin functions
//   const addNewUser = async () => {
//     if (!newUserUsername || !newUserEmail || !newUserPassword) {
//       alert('Please fill in all fields');
//       return;
//     }

//     try {
//       const response = await fetch(`${API_BASE_URL}/access-control/signup`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${authToken}`,
//         },
//         body: JSON.stringify({
//           username: newUserUsername,
//           email: newUserEmail,
//           password: newUserPassword,
//           role: newUserRole,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         const newUser: UserData = {
//           _id: data.user.id,
//           username: newUserUsername,
//           email: newUserEmail,
//           role: newUserRole,
//           createdAt: new Date().toISOString(),
//         };

//         setUsers([...users, newUser]);
//         setNewUserUsername('');
//         setNewUserEmail('');
//         setNewUserPassword('');
//         setNewUserRole('User');
//         alert('User added successfully!');
//       } else {
//         alert(data.message || 'Failed to add user');
//       }
//     } catch (error) {
//       console.error('Add user error:', error);
//       alert('Failed to add user');
//     }
//   };

//   const deleteUser = async (userId: string) => {
//     if (window.confirm('Are you sure you want to delete this user?')) {
//       try {
//         await fetch(`${API_BASE_URL}/access-control/users/${userId}`, {
//           method: 'DELETE',
//           headers: {
//             'Authorization': `Bearer ${authToken}`,
//           },
//         });
//         setUsers(users.filter((u) => u._id !== userId));
//         setAllUserSessions(allUserSessions.filter((s) => s.userId !== userId));
//       } catch (error) {
//         console.error('Delete user error:', error);
//         alert('Failed to delete user');
//       }
//     }
//   };

//   const loadAllUserSessions = async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/session`, {
//         headers: {
//           'Authorization': `Bearer ${authToken}`,
//         },
//       });
//       const sessions: SessionData[] = await response.json();
//       if (response.ok) {
//         const enrichedSessions = sessions.map((session) => ({
//           ...session,
//           userName: users.find((u) => u._id === session.userId)?.email || 'Unknown',
//         }));
//         setAllUserSessions(enrichedSessions);
//       } else {
//         console.error('Failed to fetch sessions:', await response.text());
//       }
//     } catch (error) {
//       console.error('Load sessions error:', error);
//     }
//   };

//   // User functions
//   const loadUserData = async (userId: string) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/session`, {
//         headers: {
//           'Authorization': `Bearer ${authToken}`,
//         },
//       });
//       const sessions: SessionData[] = await response.json();
//       if (response.ok) {
//         const userSessions = sessions.filter((s) => s.userId === userId);
//         setSessionHistory(userSessions);

//         const today = getTodayKey();
//         const todaySession = userSessions.find(
//           (s) => new Date(s.checkIn).toISOString().split('T')[0] === today
//         );

//         if (todaySession) {
//           setCheckInTime(new Date(todaySession.checkIn));
//           setCheckOutTime(todaySession.checkOut ? new Date(todaySession.checkOut) : null);
//           setCurrentSessionId(todaySession._id);
//         }
//       } else {
//         console.error('Failed to fetch user sessions:', await response.text());
//       }
//     } catch (error) {
//       console.error('Load user data error:', error);
//     }
//   };

//   const handleCheckIn = async () => {
//     if (!currentUser) return;

//     setIsLoading(true);

//     try {
//       const response = await fetch(`${API_BASE_URL}/session/checkin`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${authToken}`,
//         },
//         body: JSON.stringify({ userId: currentUser._id }),
//       });

//       const newSession: SessionData = await response.json();

//       if (response.ok) {
//         setCheckInTime(new Date(newSession.checkIn));
//         setCurrentSessionId(newSession._id);
//         const enrichedSession = { ...newSession, userName: currentUser.email };
//         setSessionHistory([enrichedSession, ...sessionHistory]);
//         setAllUserSessions([enrichedSession, ...allUserSessions]);
//       } else {
//         alert((await response.json()).message || 'Check-in failed');
//       }
//     } catch (error) {
//       console.error('Check-in error:', error);
//       alert('Check-in failed');
//     }

//     setIsLoading(false);
//   };

//   const handleCheckOut = async () => {
//     if (!currentUser || !currentSessionId) return;

//     setIsLoading(true);

//     try {
//       const response = await fetch(`${API_BASE_URL}/session/checkout/${currentSessionId}`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${authToken}`,
//         },
//       });

//       const updatedSession: SessionData = await response.json();

//       if (response.ok) {
//         setCheckOutTime(new Date(updatedSession.checkOut!));
//         const updatedSessions = sessionHistory.map((s) =>
//           s._id === currentSessionId ? { ...s, checkOut: new Date(updatedSession.checkOut!) } : s
//         );
//         setSessionHistory(updatedSessions);

//         const updatedAllSessions = allUserSessions.map((s) =>
//           s._id === currentSessionId ? { ...s, checkOut: new Date(updatedSession.checkOut!) } : s
//         );
//         setAllUserSessions(updatedAllSessions);

//         setCurrentSessionId(null);
//       } else {
//         alert((await response.json()).message || 'Check-out failed');
//       }
//     } catch (error) {
//       console.error('Check-out error:', error);
//       alert('Check-out failed');
//     }

//     setIsLoading(false);
//   };

//   // Utility functions
//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       weekday: 'short',
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     });
//   };

//   const formatTime = (time: Date | null) => {
//     if (!time) return 'Not yet';
//     return time.toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true,
//     });
//   };

//   const calculateHours = (checkIn: Date | null, checkOut: Date | null) => {
//     if (!checkIn || !checkOut) return 'N/A';
//     const diffMs = checkOut.getTime() - checkIn.getTime();
//     const diffHours = diffMs / (1000 * 60 * 60);
//     return diffHours >= 0 ? `${diffHours.toFixed(1)}h` : 'N/A';
//   };

//   // Render login/signup screen
//   if (!loggedIn) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
//         <div className="absolute inset-0 overflow-hidden">
//           <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
//           <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
//         </div>

//         <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-md">
//           <div className="text-center space-y-6">
//             <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
//               <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//               </svg>
//             </div>

//             <h2 className="text-3xl font-bold text-white">Time Tracker</h2>
//             <p className="text-blue-200">{isSignupMode ? 'Create your account' : 'Sign in to your account'}</p>

//             <div className="space-y-4">
//               {isSignupMode && (
//                 <input
//                   type="text"
//                   placeholder="Username"
//                   value={signupUsername}
//                   onChange={(e) => setSignupUsername(e.target.value)}
//                   className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//                 />
//               )}

//               <input
//                 type="email"
//                 placeholder="Email"
//                 value={isSignupMode ? signupEmail : loginEmail}
//                 onChange={(e) => (isSignupMode ? setSignupEmail(e.target.value) : setLoginEmail(e.target.value))}
//                 className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//               />

//               <input
//                 type="password"
//                 placeholder="Password"
//                 value={isSignupMode ? signupPassword : loginPassword}
//                 onChange={(e) => (isSignupMode ? setSignupPassword(e.target.value) : setLoginPassword(e.target.value))}
//                 className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//                 onKeyPress={(e) => e.key === 'Enter' && (isSignupMode ? handleSignup() : handleLogin())}
//               />

//               <select
//                 value={isSignupMode ? signupRole : loginRole}
//                 onChange={(e) =>
//                   isSignupMode
//                     ? setSignupRole(e.target.value as 'Admin' | 'User')
//                     : setLoginRole(e.target.value as 'Admin' | 'User')
//                 }
//                 className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//               >
//                 <option value="User" className="bg-gray-800">
//                   User
//                 </option>
//                 <option value="Admin" className="bg-gray-800">
//                   Admin
//                 </option>
//               </select>

//               <button
//                 onClick={isSignupMode ? handleSignup : handleLogin}
//                 disabled={isLoading}
//                 className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 rounded-2xl transition-all duration-300"
//               >
//                 {isLoading ? (isSignupMode ? 'Creating Account...' : 'Signing In...') : isSignupMode ? 'Sign Up' : 'Sign In'}
//               </button>

//               <button
//                 onClick={() => setIsSignupMode(!isSignupMode)}
//                 className="w-full text-blue-300 hover:text-white font-medium transition-colors"
//               >
//                 {isSignupMode ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Admin Dashboard
//   if (currentUser?.role === 'Admin') {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 mb-6">
//             <div className="flex justify-between items-center">
//               <div>
//                 <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
//                 <p className="text-blue-200">Welcome, {currentUser.username || currentUser.email}</p>
//               </div>
//               <button
//                 onClick={handleLogout}
//                 className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-colors"
//               >
//                 Logout
//               </button>
//             </div>
//           </div>

//           {/* Navigation Tabs */}
//           <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-2 mb-6">
//             <div className="flex space-x-2">
//               {[
//                 { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
//                 { id: 'users', label: '👥 Manage Users', icon: '👥' },
//                 { id: 'reports', label: '📋 All Reports', icon: '📋' },
//               ].map((tab) => (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id as any)}
//                   className={`flex-1 py-3 px-4 rounded-2xl font-medium transition-all duration-300 ${
//                     activeTab === tab.id ? 'bg-blue-500 text-white shadow-lg' : 'text-blue-200 hover:text-white hover:bg-white/10'
//                   }`}
//                 >
//                   {tab.label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Dashboard Tab */}
//           {activeTab === 'dashboard' && (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
//                 <h3 className="text-white font-semibold mb-4 flex items-center">👥 Total Users</h3>
//                 <p className="text-3xl font-bold text-white">{users.filter((u) => u.role === 'User').length}</p>
//                 <p className="text-blue-200 text-sm mt-2">Active employees</p>
//               </div>

//               <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
//                 <h3 className="text-white font-semibold mb-4 flex items-center">✅ Today's Check-ins</h3>
//                 <p className="text-3xl font-bold text-green-400">
//                   {allUserSessions.filter((s) => new Date(s.checkIn).toISOString().split('T')[0] === getTodayKey() && s.checkIn).length}
//                 </p>
//                 <p className="text-blue-200 text-sm mt-2">Users checked in today</p>
//               </div>

//               <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
//                 <h3 className="text-white font-semibold mb-4 flex items-center">🏃‍♂️ Currently Active</h3>
//                 <p className="text-3xl font-bold text-yellow-400">
//                   {allUserSessions.filter(
//                     (s) => new Date(s.checkIn).toISOString().split('T')[0] === getTodayKey() && s.checkIn && !s.checkOut
//                   ).length}
//                 </p>
//                 <p className="text-blue-200 text-sm mt-2">Users currently working</p>
//               </div>
//             </div>
//           )}

//           {/* Users Management Tab */}
//           {activeTab === 'users' && (
//             <div className="space-y-6">
//               {/* Add New User */}
//               <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
//                 <h3 className="text-white font-semibold mb-4">➕ Add New User</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//                   <input
//                     type="text"
//                     placeholder="Username"
//                     value={newUserUsername}
//                     onChange={(e) => setNewUserUsername(e.target.value)}
//                     className="p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200"
//                   />
//                   <input
//                     type="email"
//                     placeholder="Email"
//                     value={newUserEmail}
//                     onChange={(e) => setNewUserEmail(e.target.value)}
//                     className="p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200"
//                   />
//                   <input
//                     type="password"
//                     placeholder="Password"
//                     value={newUserPassword}
//                     onChange={(e) => setNewUserPassword(e.target.value)}
//                     className="p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200"
//                   />
//                   <select
//                     value={newUserRole}
//                     onChange={(e) => setNewUserRole(e.target.value as 'Admin' | 'User')}
//                     className="p-3 bg-white/10 border border-white/20 rounded-xl text-white"
//                   >
//                     <option value="User" className="bg-gray-800">
//                       User
//                     </option>
//                     <option value="Admin" className="bg-gray-800">
//                       Admin
//                     </option>
//                   </select>
//                   <button
//                     onClick={addNewUser}
//                     className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors"
//                   >
//                     Add User
//                   </button>
//                 </div>
//               </div>

//               {/* Users List */}
//               <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
//                 <h3 className="text-white font-semibold mb-4">👥 All Users</h3>
//                 <div className="space-y-3">
//                   {users.map((user) => (
//                     <div key={user._id} className="bg-white/5 rounded-xl p-4 flex justify-between items-center">
//                       <div>
//                         <p className="text-white font-medium">{user.username || user.email}</p>
//                         <p className="text-blue-200 text-sm">
//                           {user.email} • Role: {user.role} • Created: {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
//                         </p>
//                       </div>
//                       <div className="flex gap-2">
//                         <span
//                           className={`px-3 py-1 rounded-full text-xs font-medium ${
//                             user.role === 'Admin' ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'
//                           }`}
//                         >
//                           {user.role}
//                         </span>
//                         {user.email !== currentUser?.email && (
//                           <button
//                             onClick={() => deleteUser(user._id)}
//                             className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-xs transition-colors"
//                           >
//                             Delete
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Reports Tab */}
//           {activeTab === 'reports' && (
//             <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
//               <h3 className="text-white font-semibold mb-6">📋 All User Sessions</h3>
//               <div className="space-y-3 max-h-96 overflow-y-auto">
//                 {allUserSessions.length > 0 ? (
//                   allUserSessions
//                     .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())
//                     .map((session, index) => (
//                       <div key={`${session._id}-${index}`} className="bg-white/5 rounded-xl p-4 border border-white/10">
//                         <div className="flex justify-between items-start mb-3">
//                           <div>
//                             <p className="text-white font-medium">{session.userName}</p>
//                             <p className="text-blue-200 text-sm">{formatDate(session.checkIn.toISOString())}</p>
//                           </div>
//                           <div className="flex gap-2">
//                             {new Date(session.checkIn).toISOString().split('T')[0] === getTodayKey() && (
//                               <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Today</span>
//                             )}
//                             {session.checkIn && !session.checkOut && (
//                               <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Active</span>
//                             )}
//                           </div>
//                         </div>
//                         <div className="grid grid-cols-3 gap-4 text-sm">
//                           <div>
//                             <span className="text-blue-200">Check In: </span>
//                             <span className="text-white font-mono">{formatTime(session.checkIn)}</span>
//                           </div>
//                           <div>
//                             <span className="text-blue-200">Check Out: </span>
//                             <span className="text-white font-mono">{formatTime(session.checkOut)}</span>
//                           </div>
//                           <div>
//                             <span className="text-blue-200">Hours: </span>
//                             <span className="text-white font-mono">
//                               {calculateHours(session.checkIn, session.checkOut)}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     ))
//                 ) : (
//                   <p className="text-blue-200 text-center py-8">No session data available</p>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   }

//   // User Dashboard
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
//       </div>

//       <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-2xl">
//         <div className="text-center mb-8">
//           <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
//             <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//             </svg>
//           </div>
//           <h2 className="text-2xl font-bold text-white mb-2">Welcome back!</h2>
//           <p className="text-blue-200 text-sm">{currentUser?.email}</p>
//         </div>

//         <div className="space-y-4 mb-6">
//           <div className="grid grid-cols-2 gap-4">
//             <button
//               onClick={handleCheckIn}
//               disabled={isLoading || !!currentSessionId}
//               className={`group relative ${
//                 isLoading || !!currentSessionId
//                   ? 'bg-gray-500 cursor-not-allowed'
//                   : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
//               } text-white font-semibold py-4 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
//             >
//               <span>{isLoading ? 'Loading...' : 'Check In'}</span>
//             </button>

//             <button
//               onClick={handleCheckOut}
//               disabled={!currentSessionId || isLoading}
//               className={`group relative ${
//                 currentSessionId && !isLoading
//                   ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
//                   : 'bg-gray-500 cursor-not-allowed'
//               } text-white font-semibold py-4 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
//             >
//               <span>{isLoading ? 'Loading...' : 'Check Out'}</span>
//             </button>
//           </div>
//         </div>

//         <div className="space-y-4">
//           <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
//             <h3 className="text-white font-semibold mb-3">⏱️ Today's Time Tracking</h3>
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-blue-200">Check-In:</span>
//                 <span className="text-white font-mono">{formatTime(checkInTime)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-blue-200">Check-Out:</span>
//                 <span className="text-white font-mono">{formatTime(checkOutTime)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-blue-200">Hours:</span>
//                 <span className="text-white font-mono">{calculateHours(checkInTime, checkOutTime)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-blue-200">Status:</span>
//                 <span className={`font-mono ${currentSessionId ? 'text-green-400' : 'text-gray-400'}`}>
//                   {currentSessionId ? 'Checked In' : 'Not Active'}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
//             <h3 className="text-white font-semibold mb-3">📊 My History</h3>
//             <div className="space-y-2 max-h-40 overflow-y-auto">
//               {sessionHistory.length > 0 ? (
//                 sessionHistory.map((session, index) => (
//                   <div key={`${session._id}-${index}`} className="bg-white/5 rounded-xl p-3 border border-white/10">
//                     <div className="flex justify-between items-center mb-2">
//                       <span className="text-white font-medium text-sm">{formatDate(session.checkIn.toISOString())}</span>
//                       {new Date(session.checkIn).toISOString().split('T')[0] === getTodayKey() && (
//                         <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Today</span>
//                       )}
//                     </div>
//                     <div className="grid grid-cols-3 gap-2 text-xs">
//                       <div>
//                         <span className="text-blue-200">In: </span>
//                         <span className="text-white font-mono">{formatTime(session.checkIn)}</span>
//                       </div>
//                       <div>
//                         <span className="text-blue-200">Out: </span>
//                         <span className="text-white font-mono">{formatTime(session.checkOut)}</span>
//                       </div>
//                       <div>
//                         <span className="text-blue-200">Hours: </span>
//                         <span className="text-white font-mono">
//                           {calculateHours(session.checkIn, session.checkOut)}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-blue-200 text-sm text-center py-4">No history available</p>
//               )}
//             </div>
//           </div>
//         </div>

//         <button
//           onClick={handleLogout}
//           className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-2xl transition-all duration-300 border border-white/20"
//         >
//           Logout
//         </button>
//       </div>
//     </div>
//   );
// }









// 'use client';

// import { useState, useEffect } from 'react';

// interface LocationData {
//   _id?: string;
//   city: string;
//   state: string;
//   country: string;
//   ip: string;
//   createdAt?: string;
//   updatedAt?: string;
// }

// interface SessionData {
//   _id: string;
//   userId: string;
//   checkIn?: string; // Made optional to handle missing data
//   checkOut?: string | null; // Made optional to handle missing data
//   createdAt?: string;
//   userName?: string; // Optional, populated client-side
// }

// interface UserData {
//   _id: string;
//   username: string;
//   email: string;
//   role: 'Admin' | 'User';
//   createdAt?: string;
// }

// interface AuthResponse {
//   message: string;
//   token: string;
//   user: {
//     id: string;
//     username: string;
//     email: string;
//     role: 'Admin' | 'User';
//   };
// }

// // API configuration
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// export default function AdminTimeTracker() {
//   const [currentUser, setCurrentUser] = useState<UserData | null>(null);
//   const [authToken, setAuthToken] = useState<string | null>(null);
//   const [loginEmail, setLoginEmail] = useState('');
//   const [loginPassword, setLoginPassword] = useState('');
//   const [loginRole, setLoginRole] = useState<'Admin' | 'User'>('User');
//   const [loggedIn, setLoggedIn] = useState(false);
//   const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'reports'>('dashboard');
//   const [isSignupMode, setIsSignupMode] = useState(false);

//   // Signup states
//   const [signupUsername, setSignupUsername] = useState('');
//   const [signupEmail, setSignupEmail] = useState('');
//   const [signupPassword, setSignupPassword] = useState('');
//   const [signupRole, setSignupRole] = useState<'Admin' | 'User'>('User');

//   // User management states
//   const [users, setUsers] = useState<UserData[]>([]);
//   const [newUserUsername, setNewUserUsername] = useState('');
//   const [newUserEmail, setNewUserEmail] = useState('');
//   const [newUserPassword, setNewUserPassword] = useState('');
//   const [newUserRole, setNewUserRole] = useState<'Admin' | 'User'>('User');

//   // Time tracking states
//   const [checkInTime, setCheckInTime] = useState<Date | null>(null);
//   const [checkOutTime, setCheckOutTime] = useState<Date | null>(null);
//   const [location, setLocation] = useState<LocationData | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [sessionHistory, setSessionHistory] = useState<SessionData[]>([]);
//   const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
//   const [allUserSessions, setAllUserSessions] = useState<SessionData[]>([]);

//   const getTodayKey = () => new Date().toISOString().split('T')[0];

//   // Check for saved token on component mount
//   useEffect(() => {
//     const savedToken = localStorage.getItem('authToken');
//     const savedUser = localStorage.getItem('currentUser');

//     if (savedToken && savedUser) {
//       setAuthToken(savedToken);
//       setCurrentUser(JSON.parse(savedUser));
//       setLoggedIn(true);

//       const user = JSON.parse(savedUser);
//       if (user.role === 'User') {
//         loadUserData(user.id).catch(console.error);
//       } else {
//         Promise.all([loadAllUserSessions(), loadAllUsers()]).catch(console.error);
//       }
//     }
//   }, []);

//   // Fetch all users (Admin only)
//   const loadAllUsers = async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/access-control/users`, {
//         headers: { 'Authorization': `Bearer ${authToken}` },
//       });
//       const data = await response.json();
//       if (response.ok) {
//         setUsers(data);
//       } else {
//         console.error('Failed to fetch users:', data.message);
//       }
//     } catch (error) {
//       console.error('Load users error:', error);
//     }
//   };

//   // Authentication functions
//   const handleLogin = async () => {
//     setIsLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/access-control/login`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email: loginEmail, password: loginPassword, role: loginRole }),
//       });
//       const data: AuthResponse = await response.json();
//       if (response.ok) {
//         const userData: UserData = {
//           _id: data.user.id,
//           username: data.user.username,
//           email: data.user.email,
//           role: data.user.role,
//         };
//         setCurrentUser(userData);
//         setAuthToken(data.token);
//         setLoggedIn(true);
//         setLoginEmail('');
//         setLoginPassword('');

//         localStorage.setItem('authToken', data.token);
//         localStorage.setItem('currentUser', JSON.stringify(userData));

//         if (userData.role === 'User') {
//           await loadUserData(userData._id);
//         } else {
//           await Promise.all([loadAllUserSessions(), loadAllUsers()]);
//         }
//       } else {
//         alert(data.message || 'Login failed');
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       alert('Login failed. Please try again.');
//     }
//     setIsLoading(false);
//   };

//   const handleSignup = async () => {
//     setIsLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/access-control/signup`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username: signupUsername, email: signupEmail, password: signupPassword, role: signupRole }),
//       });
//       const data = await response.json();
//       if (response.ok) {
//         alert('Signup successful! You can now login.');
//         setIsSignupMode(false);
//         setSignupUsername('');
//         setSignupEmail('');
//         setSignupPassword('');
//         setSignupRole('User');
//       } else {
//         alert(data.message || 'Signup failed');
//       }
//     } catch (error) {
//       console.error('Signup error:', error);
//       alert('Signup failed. Please try again.');
//     }
//     setIsLoading(false);
//   };

//   const handleLogout = () => {
//     setCurrentUser(null);
//     setAuthToken(null);
//     setLoggedIn(false);
//     setCheckInTime(null);
//     setCheckOutTime(null);
//     setLocation(null);
//     setSessionHistory([]);
//     setCurrentSessionId(null);
//     setActiveTab('dashboard');
//     setUsers([]);
//     setAllUserSessions([]);

//     localStorage.removeItem('authToken');
//     localStorage.removeItem('currentUser');
//   };

//   // Admin functions
//   const addNewUser = async () => {
//     if (!newUserUsername || !newUserEmail || !newUserPassword) {
//       alert('Please fill in all fields');
//       return;
//     }
//     try {
//       const response = await fetch(`${API_BASE_URL}/access-control/signup`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
//         body: JSON.stringify({ username: newUserUsername, email: newUserEmail, password: newUserPassword, role: newUserRole }),
//       });
//       const data = await response.json();
//       if (response.ok) {
//         const newUser: UserData = {
//           _id: data.user.id,
//           username: newUserUsername,
//           email: newUserEmail,
//           role: newUserRole,
//           createdAt: new Date().toISOString(),
//         };
//         setUsers([...users, newUser]);
//         setNewUserUsername('');
//         setNewUserEmail('');
//         setNewUserPassword('');
//         setNewUserRole('User');
//         alert('User added successfully!');
//       } else {
//         alert(data.message || 'Failed to add user');
//       }
//     } catch (error) {
//       console.error('Add user error:', error);
//       alert('Failed to add user');
//     }
//   };

//   const deleteUser = async (userId: string) => {
//     if (window.confirm('Are you sure you want to delete this user?')) {
//       try {
//         await fetch(`${API_BASE_URL}/access-control/users/${userId}`, {
//           method: 'DELETE',
//           headers: { 'Authorization': `Bearer ${authToken}` },
//         });
//         setUsers(users.filter((u) => u._id !== userId));
//         setAllUserSessions(allUserSessions.filter((s) => s.userId !== userId));
//       } catch (error) {
//         console.error('Delete user error:', error);
//         alert('Failed to delete user');
//       }
//     }
//   };

//   const loadAllUserSessions = async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/session`, {
//         headers: { 'Authorization': `Bearer ${authToken}` },
//       });
//       const sessions: SessionData[] = await response.json();
//       if (response.ok) {
//         const enrichedSessions = sessions.map((session) => ({
//           ...session,
//           userName: users.find((u) => u._id === session.userId)?.email || 'Unknown',
//         })).filter((s) => s.checkIn); // Filter out sessions with no checkIn
//         setAllUserSessions(enrichedSessions);
//       } else {
//         console.error('Failed to fetch sessions:', await response.text());
//       }
//     } catch (error) {
//       console.error('Load sessions error:', error);
//     }
//   };

//   // User functions
//   const loadUserData = async (userId: string) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/session`, {
//         headers: { 'Authorization': `Bearer ${authToken}` },
//       });
//       const sessions: SessionData[] = await response.json();
//       if (response.ok) {
//         const userSessions = sessions.filter((s) => s.userId === userId && s.checkIn);
//         setSessionHistory(userSessions);

//         const today = getTodayKey();
//         const todaySession = userSessions.find((s) => s.checkIn && new Date(s.checkIn).toISOString().split('T')[0] === today);

//         if (todaySession?.checkIn) {
//           setCheckInTime(new Date(todaySession.checkIn));
//           setCheckOutTime(todaySession.checkOut ? new Date(todaySession.checkOut) : null);
//           setCurrentSessionId(todaySession._id);
//         }
//       } else {
//         console.error('Failed to fetch user sessions:', await response.text());
//       }
//     } catch (error) {
//       console.error('Load user data error:', error);
//     }
//   };

//   const handleCheckIn = async () => {
//     if (!currentUser) return;
//     setIsLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/session/checkin`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
//         body: JSON.stringify({ userId: currentUser._id }),
//       });
//       const data = await response.json();
//       if (response.ok && data._id && data.checkIn) {
//         const newSession: SessionData = {
//           ...data,
//           checkIn: new Date(data.checkIn).toISOString(),
//           checkOut: null,
//           userName: currentUser.email,
//         };
//         setCheckInTime(new Date(newSession.checkIn));
//         setCurrentSessionId(newSession._id);
//         setSessionHistory([newSession, ...sessionHistory]);
//         setAllUserSessions([newSession, ...allUserSessions]);
//       } else {
//         alert(data.message || 'Check-in failed');
//       }
//     } catch (error) {
//       console.error('Check-in error:', error);
//       alert('Check-in failed');
//     }
//     setIsLoading(false);
//   };

//   const handleCheckOut = async () => {
//     if (!currentUser || !currentSessionId) return;
//     setIsLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/session/checkout/${currentSessionId}`, {
//         method: 'PUT',
//         headers: { 'Authorization': `Bearer ${authToken}` },
//       });
//       const data = await response.json();
//       if (response.ok && data._id && data.checkOut) {
//         const updatedSession: SessionData = {
//           ...data,
//           checkOut: new Date(data.checkOut).toISOString(),
//           userName: currentUser.email,
//         };
//         setCheckOutTime(new Date(updatedSession.checkOut));
//         setSessionHistory((prev) =>
//           prev.map((s) => (s._id === currentSessionId ? { ...s, checkOut: updatedSession.checkOut } : s))
//         );
//         setAllUserSessions((prev) =>
//           prev.map((s) => (s._id === currentSessionId ? { ...s, checkOut: updatedSession.checkOut } : s))
//         );
//         setCurrentSessionId(null);
//       } else {
//         alert(data.message || 'Check-out failed');
//       }
//     } catch (error) {
//       console.error('Check-out error:', error);
//       alert('Check-out failed');
//     }
//     setIsLoading(false);
//   };

//   // Utility functions
//   const formatDate = (dateString?: string) => {
//     if (!dateString || isNaN(new Date(dateString).getTime())) return 'Invalid Date';
//     return new Date(dateString).toLocaleDateString('en-US', {
//       weekday: 'short',
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     });
//   };

//   const formatTime = (time: Date | null) => {
//     if (!time || isNaN(time.getTime())) return 'Not yet';
//     return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
//   };

//   const calculateHours = (checkIn: Date | null, checkOut: Date | null) => {
//     if (!checkIn || !checkOut || isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return 'N/A';
//     const diffMs = checkOut.getTime() - checkIn.getTime();
//     const diffHours = diffMs / (1000 * 60 * 60);
//     return diffHours >= 0 ? `${diffHours.toFixed(1)}h` : 'N/A';
//   };

//   // Render login/signup screen
//   if (!loggedIn) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
//         <div className="absolute inset-0 overflow-hidden">
//           <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
//           <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
//         </div>
//         <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-md">
//           <div className="text-center space-y-6">
//             <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
//               <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//               </svg>
//             </div>
//             <h2 className="text-3xl font-bold text-white">Time Tracker</h2>
//             <p className="text-blue-200">{isSignupMode ? 'Create your account' : 'Sign in to your account'}</p>
//             <div className="space-y-4">
//               {isSignupMode && (
//                 <input
//                   type="text"
//                   placeholder="Username"
//                   value={signupUsername}
//                   onChange={(e) => setSignupUsername(e.target.value)}
//                   className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//                 />
//               )}
//               <input
//                 type="email"
//                 placeholder="Email"
//                 value={isSignupMode ? signupEmail : loginEmail}
//                 onChange={(e) => (isSignupMode ? setSignupEmail(e.target.value) : setLoginEmail(e.target.value))}
//                 className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//               />
//               <input
//                 type="password"
//                 placeholder="Password"
//                 value={isSignupMode ? signupPassword : loginPassword}
//                 onChange={(e) => (isSignupMode ? setSignupPassword(e.target.value) : setLoginPassword(e.target.value))}
//                 className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//                 onKeyPress={(e) => e.key === 'Enter' && (isSignupMode ? handleSignup() : handleLogin())}
//               />
//               <select
//                 value={isSignupMode ? signupRole : loginRole}
//                 onChange={(e) => (isSignupMode ? setSignupRole(e.target.value as 'Admin' | 'User') : setLoginRole(e.target.value as 'Admin' | 'User'))}
//                 className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//               >
//                 <option value="User" className="bg-gray-800">User</option>
//                 <option value="Admin" className="bg-gray-800">Admin</option>
//               </select>
//               <button
//                 onClick={isSignupMode ? handleSignup : handleLogin}
//                 disabled={isLoading}
//                 className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 rounded-2xl transition-all duration-300"
//               >
//                 {isLoading ? (isSignupMode ? 'Creating Account...' : 'Signing In...') : isSignupMode ? 'Sign Up' : 'Sign In'}
//               </button>
//               <button
//                 onClick={() => setIsSignupMode(!isSignupMode)}
//                 className="w-full text-blue-300 hover:text-white font-medium transition-colors"
//               >
//                 {isSignupMode ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Admin Dashboard
//   if (currentUser?.role === 'Admin') {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
//         <div className="max-w-7xl mx-auto">
//           <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 mb-6">
//             <div className="flex justify-between items-center">
//               <div>
//                 <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
//                 <p className="text-blue-200">Welcome, {currentUser.username || currentUser.email}</p>
//               </div>
//               <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-colors">
//                 Logout
//               </button>
//             </div>
//           </div>
//           <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-2 mb-6">
//             <div className="flex space-x-2">
//               {['dashboard', 'users', 'reports'].map((tab) => (
//                 <button
//                   key={tab}
//                   onClick={() => setActiveTab(tab as 'dashboard' | 'users' | 'reports')}
//                   className={`flex-1 py-3 px-4 rounded-2xl font-medium transition-all duration-300 ${
//                     activeTab === tab ? 'bg-blue-500 text-white shadow-lg' : 'text-blue-200 hover:text-white hover:bg-white/10'
//                   }`}
//                 >
//                   {tab === 'dashboard' ? '📊 Dashboard' : tab === 'users' ? '👥 Manage Users' : '📋 All Reports'}
//                 </button>
//               ))}
//             </div>
//           </div>
//           {activeTab === 'dashboard' && (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
//                 <h3 className="text-white font-semibold mb-4 flex items-center">👥 Total Users</h3>
//                 <p className="text-3xl font-bold text-white">{users.filter((u) => u.role === 'User').length}</p>
//                 <p className="text-blue-200 text-sm mt-2">Active employees</p>
//               </div>
//               <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
//                 <h3 className="text-white font-semibold mb-4 flex items-center">✅ Today's Check-ins</h3>
//                 <p className="text-3xl font-bold text-green-400">
//                   {allUserSessions.filter((s) => s.checkIn && new Date(s.checkIn).toISOString().split('T')[0] === getTodayKey()).length}
//                 </p>
//                 <p className="text-blue-200 text-sm mt-2">Users checked in today</p>
//               </div>
//               <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
//                 <h3 className="text-white font-semibold mb-4 flex items-center">🏃‍♂️ Currently Active</h3>
//                 <p className="text-3xl font-bold text-yellow-400">
//                   {allUserSessions.filter((s) => s.checkIn && !s.checkOut && new Date(s.checkIn).toISOString().split('T')[0] === getTodayKey()).length}
//                 </p>
//                 <p className="text-blue-200 text-sm mt-2">Users currently working</p>
//               </div>
//             </div>
//           )}
//           {activeTab === 'users' && (
//             <div className="space-y-6">
//               <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
//                 <h3 className="text-white font-semibold mb-4">➕ Add New User</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//                   <input
//                     type="text"
//                     placeholder="Username"
//                     value={newUserUsername}
//                     onChange={(e) => setNewUserUsername(e.target.value)}
//                     className="p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200"
//                   />
//                   <input
//                     type="email"
//                     placeholder="Email"
//                     value={newUserEmail}
//                     onChange={(e) => setNewUserEmail(e.target.value)}
//                     className="p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200"
//                   />
//                   <input
//                     type="password"
//                     placeholder="Password"
//                     value={newUserPassword}
//                     onChange={(e) => setNewUserPassword(e.target.value)}
//                     className="p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200"
//                   />
//                   <select
//                     value={newUserRole}
//                     onChange={(e) => setNewUserRole(e.target.value as 'Admin' | 'User')}
//                     className="p-3 bg-white/10 border border-white/20 rounded-xl text-white"
//                   >
//                     <option value="User" className="bg-gray-800">User</option>
//                     <option value="Admin" className="bg-gray-800">Admin</option>
//                   </select>
//                   <button onClick={addNewUser} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors">
//                     Add User
//                   </button>
//                 </div>
//               </div>
//               <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
//                 <h3 className="text-white font-semibold mb-4">👥 All Users</h3>
//                 <div className="space-y-3">
//                   {users.map((user) => (
//                     <div key={user._id} className="bg-white/5 rounded-xl p-4 flex justify-between items-center">
//                       <div>
//                         <p className="text-white font-medium">{user.username || user.email}</p>
//                         <p className="text-blue-200 text-sm">{user.email} • Role: {user.role} • Created: {user.createdAt ? formatDate(user.createdAt) : 'N/A'}</p>
//                       </div>
//                       <div className="flex gap-2">
//                         <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'Admin' ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'}`}>
//                           {user.role}
//                         </span>
//                         {user.email !== currentUser?.email && (
//                           <button onClick={() => deleteUser(user._id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-xs transition-colors">
//                             Delete
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}
//           {activeTab === 'reports' && (
//             <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
//               <h3 className="text-white font-semibold mb-6">📋 All User Sessions</h3>
//               <div className="space-y-3 max-h-96 overflow-y-auto">
//                 {allUserSessions.length > 0 ? (
//                   allUserSessions
//                     .sort((a, b) => (b.checkIn && a.checkIn ? new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime() : 0))
//                     .map((session) => (
//                       <div key={session._id} className="bg-white/5 rounded-xl p-4 border border-white/10">
//                         <div className="flex justify-between items-start mb-3">
//                           <div>
//                             <p className="text-white font-medium">{session.userName}</p>
//                             <p className="text-blue-200 text-sm">{session.checkIn ? formatDate(session.checkIn) : 'N/A'}</p>
//                           </div>
//                           <div className="flex gap-2">
//                             {session.checkIn && new Date(session.checkIn).toISOString().split('T')[0] === getTodayKey() && <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Today</span>}
//                             {session.checkIn && !session.checkOut && <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Active</span>}
//                           </div>
//                         </div>
//                         <div className="grid grid-cols-3 gap-4 text-sm">
//                           <div><span className="text-blue-200">Check In: </span><span className="text-white font-mono">{session.checkIn ? formatTime(new Date(session.checkIn)) : 'N/A'}</span></div>
//                           <div><span className="text-blue-200">Check Out: </span><span className="text-white font-mono">{session.checkOut ? formatTime(new Date(session.checkOut)) : 'N/A'}</span></div>
//                           <div><span className="text-blue-200">Hours: </span><span className="text-white font-mono">{session.checkIn && session.checkOut ? calculateHours(new Date(session.checkIn), new Date(session.checkOut)) : 'N/A'}</span></div>
//                         </div>
//                       </div>
//                     ))
//                 ) : (
//                   <p className="text-blue-200 text-center py-8">No session data available</p>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   }

//   // User Dashboard
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
//       </div>
//       <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-2xl">
//         <div className="text-center mb-8">
//           <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
//             <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//             </svg>
//           </div>
//           <h2 className="text-2xl font-bold text-white mb-2">Welcome back!</h2>
//           <p className="text-blue-200 text-sm">{currentUser?.email}</p>
//         </div>
//         <div className="space-y-4 mb-6">
//           <div className="grid grid-cols-2 gap-4">
//             <button
//               onClick={handleCheckIn}
//               disabled={isLoading || !!currentSessionId}
//               className={`group relative ${isLoading || !!currentSessionId ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'} text-white font-semibold py-4 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
//             >
//               <span>{isLoading ? 'Loading...' : 'Check In'}</span>
//             </button>
//             <button
//               onClick={handleCheckOut}
//               disabled={!currentSessionId || isLoading}
//               className={`group relative ${currentSessionId && !isLoading ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700' : 'bg-gray-500 cursor-not-allowed'} text-white font-semibold py-4 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
//             >
//               <span>{isLoading ? 'Loading...' : 'Check Out'}</span>
//             </button>
//           </div>
//         </div>
//         <div className="space-y-4">
//           <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
//             <h3 className="text-white font-semibold mb-3">⏱️ Today's Time Tracking</h3>
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between"><span className="text-blue-200">Check-In:</span><span className="text-white font-mono">{formatTime(checkInTime)}</span></div>
//               <div className="flex justify-between"><span className="text-blue-200">Check-Out:</span><span className="text-white font-mono">{formatTime(checkOutTime)}</span></div>
//               <div className="flex justify-between"><span className="text-blue-200">Hours:</span><span className="text-white font-mono">{calculateHours(checkInTime, checkOutTime)}</span></div>
//               <div className="flex justify-between"><span className="text-blue-200">Status:</span><span className={`font-mono ${currentSessionId ? 'text-green-400' : 'text-gray-400'}`}>{currentSessionId ? 'Checked In' : 'Not Active'}</span></div>
//             </div>
//           </div>
//           <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
//             <h3 className="text-white font-semibold mb-3">📊 My History</h3>
//             <div className="space-y-2 max-h-40 overflow-y-auto">
//               {sessionHistory.length > 0 ? (
//                 sessionHistory.map((session) => (
//                   <div key={session._id} className="bg-white/5 rounded-xl p-3 border border-white/10">
//                     <div className="flex justify-between items-center mb-2">
//                       <span className="text-white font-medium text-sm">{session.checkIn ? formatDate(session.checkIn) : 'N/A'}</span>
//                       {session.checkIn && new Date(session.checkIn).toISOString().split('T')[0] === getTodayKey() && <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Today</span>}
//                     </div>
//                     <div className="grid grid-cols-3 gap-2 text-xs">
//                       <div><span className="text-blue-200">In: </span><span className="text-white font-mono">{session.checkIn ? formatTime(new Date(session.checkIn)) : 'N/A'}</span></div>
//                       <div><span className="text-blue-200">Out: </span><span className="text-white font-mono">{session.checkOut ? formatTime(new Date(session.checkOut)) : 'N/A'}</span></div>
//                       <div><span className="text-blue-200">Hours: </span><span className="text-white font-mono">{session.checkIn && session.checkOut ? calculateHours(new Date(session.checkIn), new Date(session.checkOut)) : 'N/A'}</span></div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-blue-200 text-sm text-center py-4">No history available</p>
//               )}
//             </div>
//           </div>
//         </div>
//         <button onClick={handleLogout} className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-2xl transition-all duration-300 border border-white/20">
//           Logout
//         </button>
//       </div>
//     </div>
//   );
// }






'use client';

import { useState, useEffect } from 'react';

interface UserData {
  _id: string;
  username: string;
  email: string;
  role: 'Admin' | 'User';
  createdAt?: string;
}

interface SessionData {
  _id: string;
  userId: string;
  checkIn?: string;
  checkOut?: string | null;
  createdAt?: string;
  userName?: string;
}

interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: 'Admin' | 'User';
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminTimeTracker() {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<'Admin' | 'User'>('User');
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'reports'>('dashboard');
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Signup states
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'Admin' | 'User'>('User');

  // User management states
  const [users, setUsers] = useState<UserData[]>([]);
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Admin' | 'User'>('User');

  // Time tracking states
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<SessionData[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [allUserSessions, setAllUserSessions] = useState<SessionData[]>([]);

  const getTodayKey = () => new Date().toISOString().split('T')[0];

  // Check for saved token on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');

    if (savedToken && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user && user._id && user.role) {
          setAuthToken(savedToken);
          setCurrentUser(user);
          setLoggedIn(true);

          if (user.role === 'User') {
            loadUserData(user._id).catch((error) => {
              console.error('Load user data error:', error);
              setErrorMessage('Failed to load user data');
            });
          } else if (user.role === 'Admin') {
            Promise.all([loadAllUserSessions(), loadAllUsers()])
              .catch((error) => {
                console.error('Load admin data error:', error);
                setErrorMessage('Failed to load admin data');
              });
          }
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error('Parse localStorage error:', error);
        handleLogout();
      }
    }
  }, []);

  // Fetch all users (Admin only)
  const loadAllUsers = async () => {
    if (!authToken) {
      setErrorMessage('No authentication token available');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/access-control/users`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Load users error:', error);
      setErrorMessage('Failed to load users');
    }
  };

  // Authentication functions
  const handleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/access-control/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword, role: loginRole }),
      });
      const data: AuthResponse = await response.json();
      if (response.ok && data.token && data.user) {
        const userData: UserData = {
          _id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          role: data.user.role,
        };
        setCurrentUser(userData);
        setAuthToken(data.token);
        setLoggedIn(true);
        setLoginEmail('');
        setLoginPassword('');

        localStorage.setItem('authToken', data.token);
        localStorage.setItem('currentUser', JSON.stringify(userData));

        if (userData.role === 'User') {
          await loadUserData(userData._id);
        } else if (userData.role === 'Admin') {
          await Promise.all([loadAllUserSessions(), loadAllUsers()]);
        }
      } else {
        setErrorMessage(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Login failed. Please try again.');
    }
    setIsLoading(false);
  };

  const handleSignup = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/access-control/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: signupUsername, email: signupEmail, password: signupPassword, role: signupRole }),
      });
      const data = await response.json();
      if (response.ok) {
        setErrorMessage('Signup successful! You can now login.');
        setIsSignupMode(false);
        setSignupUsername('');
        setSignupEmail('');
        setSignupPassword('');
        setSignupRole('User');
      } else {
        setErrorMessage(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrorMessage('Signup failed. Please try again.');
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    setLoggedIn(false);
    setCheckInTime(null);
    setCheckOutTime(null);
    setSessionHistory([]);
    setCurrentSessionId(null);
    setActiveTab('dashboard');
    setUsers([]);
    setAllUserSessions([]);
    setErrorMessage(null);

    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  };

  // Admin functions
  const addNewUser = async () => {
    if (!newUserUsername || !newUserEmail || !newUserPassword) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    if (!authToken) {
      setErrorMessage('No authentication token available');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/access-control/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ username: newUserUsername, email: newUserEmail, password: newUserPassword, role: newUserRole }),
      });
      const data = await response.json();
      if (response.ok && data.user) {
        const newUser: UserData = {
          _id: data.user.id,
          username: newUserUsername,
          email: newUserEmail,
          role: newUserRole,
          createdAt: new Date().toISOString(),
        };
        setUsers([...users, newUser]);
        setNewUserUsername('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserRole('User');
        setErrorMessage('User added successfully!');
      } else {
        setErrorMessage(data.message || 'Failed to add user');
      }
    } catch (error) {
      console.error('Add user error:', error);
      setErrorMessage('Failed to add user');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!authToken) {
      setErrorMessage('No authentication token available');
      return;
    }
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/access-control/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${authToken}` },
        });
        if (response.ok) {
          setUsers(users.filter((u) => u._id !== userId));
          setAllUserSessions(allUserSessions.filter((s) => s.userId !== userId));
        } else {
          throw new Error('Failed to delete user');
        }
      } catch (error) {
        console.error('Delete user error:', error);
        setErrorMessage('Failed to delete user');
      }
    }
  };

  const loadAllUserSessions = async () => {
    if (!authToken) {
      setErrorMessage('No authentication token available');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/session`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.statusText}`);
      }
      const sessions: SessionData[] = await response.json();
      if (Array.isArray(sessions)) {
        const enrichedSessions = sessions
          .filter((session) => session.checkIn && !isNaN(new Date(session.checkIn).getTime()))
          .map((session) => ({
            ...session,
            userName: users.find((u) => u._id === session.userId)?.email || 'Unknown',
          }));
        setAllUserSessions(enrichedSessions);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Load sessions error:', error);
      setErrorMessage('Failed to load sessions');
    }
  };

  // User functions
  const loadUserData = async (userId: string) => {
    if (!authToken) {
      setErrorMessage('No authentication token available');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/session`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch user sessions: ${response.statusText}`);
      }
      const sessions: SessionData[] = await response.json();
      if (Array.isArray(sessions)) {
        const userSessions = sessions
          .filter((s) => s.userId === userId && s.checkIn && !isNaN(new Date(s.checkIn).getTime()));
        setSessionHistory(userSessions);

        const today = getTodayKey();
        const todaySession = userSessions.find(
          (s) => s.checkIn && new Date(s.checkIn).toISOString().split('T')[0] === today
        );

        if (todaySession?.checkIn) {
          setCheckInTime(new Date(todaySession.checkIn));
          setCheckOutTime(todaySession.checkOut ? new Date(todaySession.checkOut) : null);
          setCurrentSessionId(todaySession._id);
        }
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Load user data error:', error);
      setErrorMessage('Failed to load user data');
    }
  };

  const handleCheckIn = async () => {
    if (!currentUser || !authToken) {
      setErrorMessage('Not authenticated');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/session/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ userId: currentUser._id }),
      });
      const data = await response.json();
      if (response.ok && data._id && data.checkIn) {
        const newSession: SessionData = {
          ...data,
          checkIn: new Date(data.checkIn).toISOString(),
          checkOut: null,
          userName: currentUser.email,
        };
        setCheckInTime(new Date(newSession.checkIn));
        setCurrentSessionId(newSession._id);
        setSessionHistory([newSession, ...sessionHistory]);
        setAllUserSessions([newSession, ...allUserSessions]);
      } else {
        setErrorMessage(data.message || 'Check-in failed');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      setErrorMessage('Check-in failed');
    }
    setIsLoading(false);
  };

  const handleCheckOut = async () => {
    if (!currentUser || !currentSessionId || !authToken) {
      setErrorMessage('Not authenticated or no active session');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/session/checkout/${currentSessionId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      const data = await response.json();
      if (response.ok && data._id && data.checkOut) {
        const updatedSession: SessionData = {
          ...data,
          checkOut: new Date(data.checkOut).toISOString(),
          userName: currentUser.email,
        };
        setCheckOutTime(new Date(updatedSession.checkOut));
        setSessionHistory((prev) =>
          prev.map((s) => (s._id === currentSessionId ? { ...s, checkOut: updatedSession.checkOut } : s))
        );
        setAllUserSessions((prev) =>
          prev.map((s) => (s._id === currentSessionId ? { ...s, checkOut: updatedSession.checkOut } : s))
        );
        setCurrentSessionId(null);
      } else {
        setErrorMessage(data.message || 'Check-out failed');
      }
    } catch (error) {
      console.error('Check-out error:', error);
      setErrorMessage('Check-out failed');
    }
    setIsLoading(false);
  };

  // Utility functions
  const formatDate = (dateString?: string) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (time: Date | null) => {
    if (!time || isNaN(time.getTime())) return 'N/A';
    return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const calculateHours = (checkIn: Date | null, checkOut: Date | null) => {
    if (!checkIn || !checkOut || isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return 'N/A';
    const diffMs = checkOut.getTime() - checkIn.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours >= 0 ? `${diffHours.toFixed(1)}h` : 'N/A';
  };

  // Render login/signup screen
  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>
        <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-md">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white">Time Tracker</h2>
            <p className="text-blue-200">{isSignupMode ? 'Create your account' : 'Sign in to your account'}</p>
            {errorMessage && <p className="text-red-400 text-sm">{errorMessage}</p>}
            <div className="space-y-4">
              {isSignupMode && (
                <input
                  type="text"
                  placeholder="Username"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={isSignupMode ? signupEmail : loginEmail}
                onChange={(e) => (isSignupMode ? setSignupEmail(e.target.value) : setLoginEmail(e.target.value))}
                className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                onKeyDown={(e) => e.key === 'Enter' && (isSignupMode ? handleSignup() : handleLogin())}
              />
              <input
                type="password"
                placeholder="Password"
                value={isSignupMode ? signupPassword : loginPassword}
                onChange={(e) => (isSignupMode ? setSignupPassword(e.target.value) : setLoginPassword(e.target.value))}
                className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                onKeyDown={(e) => e.key === 'Enter' && (isSignupMode ? handleSignup() : handleLogin())}
              />
              <select
                value={isSignupMode ? signupRole : loginRole}
                onChange={(e) => (isSignupMode ? setSignupRole(e.target.value as 'Admin' | 'User') : setLoginRole(e.target.value as 'Admin' | 'User'))}
                className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              >
                <option value="User" className="bg-gray-800">User</option>
                <option value="Admin" className="bg-gray-800">Admin</option>
              </select>
              <button
                onClick={isSignupMode ? handleSignup : handleLogin}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 rounded-2xl transition-all duration-300"
              >
                {isLoading ? (isSignupMode ? 'Creating Account...' : 'Signing In...') : isSignupMode ? 'Sign Up' : 'Sign In'}
              </button>
              <button
                onClick={() => {
                  setIsSignupMode(!isSignupMode);
                  setErrorMessage(null);
                }}
                className="w-full text-blue-300 hover:text-white font-medium transition-colors"
              >
                {isSignupMode ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  if (currentUser?.role === 'Admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-blue-200">Welcome, {currentUser.username || currentUser.email}</p>
              </div>
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-colors">
                Logout
              </button>
            </div>
            {errorMessage && <p className="text-red-400 text-sm mt-4">{errorMessage}</p>}
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-2 mb-6">
            <div className="flex space-x-2">
              {['dashboard', 'users', 'reports'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as 'dashboard' | 'users' | 'reports')}
                  className={`flex-1 py-3 px-4 rounded-2xl font-medium transition-all duration-300 ${
                    activeTab === tab ? 'bg-blue-500 text-white shadow-lg' : 'text-blue-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab === 'dashboard' ? '📊 Dashboard' : tab === 'users' ? '👥 Manage Users' : '📋 All Reports'}
                </button>
              ))}
            </div>
          </div>
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center">👥 Total Users</h3>
                <p className="text-3xl font-bold text-white">{users.filter((u) => u.role === 'User').length}</p>
                <p className="text-blue-200 text-sm mt-2">Active employees</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center">✅ Today's Check-ins</h3>
                <p className="text-3xl font-bold text-green-400">
                  {allUserSessions.filter((s) => s.checkIn && new Date(s.checkIn).toISOString().split('T')[0] === getTodayKey()).length}
                </p>
                <p className="text-blue-200 text-sm mt-2">Users checked in today</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center">🏃‍♂️ Currently Active</h3>
                <p className="text-3xl font-bold text-yellow-400">
                  {allUserSessions.filter((s) => s.checkIn && !s.checkOut && new Date(s.checkIn).toISOString().split('T')[0] === getTodayKey()).length}
                </p>
                <p className="text-blue-200 text-sm mt-2">Users currently working</p>
              </div>
            </div>
          )}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
                <h3 className="text-white font-semibold mb-4">➕ Add New User</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <input
                    type="text"
                    placeholder="Username"
                    value={newUserUsername}
                    onChange={(e) => setNewUserUsername(e.target.value)}
                    className="p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200"
                    onKeyDown={(e) => e.key === 'Enter' && addNewUser()}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200"
                    onKeyDown={(e) => e.key === 'Enter' && addNewUser()}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200"
                    onKeyDown={(e) => e.key === 'Enter' && addNewUser()}
                  />
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as 'Admin' | 'User')}
                    className="p-3 bg-white/10 border border-white/20 rounded-xl text-white"
                  >
                    <option value="User" className="bg-gray-800">User</option>
                    <option value="Admin" className="bg-gray-800">Admin</option>
                  </select>
                  <button onClick={addNewUser} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors">
                    Add User
                  </button>
                </div>
                {errorMessage && <p className="text-red-400 text-sm mt-4">{errorMessage}</p>}
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
                <h3 className="text-white font-semibold mb-4">👥 All Users</h3>
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user._id} className="bg-white/5 rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium">{user.username || user.email}</p>
                        <p className="text-blue-200 text-sm">{user.email} • Role: {user.role} • Created: {formatDate(user.createdAt)}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'Admin' ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'}`}>
                          {user.role}
                        </span>
                        {user.email !== currentUser?.email && (
                          <button onClick={() => deleteUser(user._id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-xs transition-colors">
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'reports' && (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
              <h3 className="text-white font-semibold mb-6">📋 All User Sessions</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {allUserSessions.length > 0 ? (
                  allUserSessions
                    .sort((a, b) => {
                      if (!a.checkIn || !b.checkIn) return 0;
                      return new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime();
                    })
                    .map((session) => (
                      <div key={session._id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-white font-medium">{session.userName}</p>
                            <p className="text-blue-200 text-sm">{formatDate(session.checkIn)}</p>
                          </div>
                          <div className="flex gap-2">
                            {session.checkIn && new Date(session.checkIn).toISOString().split('T')[0] === getTodayKey() && <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Today</span>}
                            {session.checkIn && !session.checkOut && <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Active</span>}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div><span className="text-blue-200">Check In: </span><span className="text-white font-mono">{formatTime(session.checkIn ? new Date(session.checkIn) : null)}</span></div>
                          <div><span className="text-blue-200">Check Out: </span><span className="text-white font-mono">{formatTime(session.checkOut ? new Date(session.checkOut) : null)}</span></div>
                          <div><span className="text-blue-200">Hours: </span><span className="text-white font-mono">{session.checkIn && session.checkOut ? calculateHours(new Date(session.checkIn), new Date(session.checkOut)) : 'N/A'}</span></div>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-blue-200 text-center py-8">No session data available</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // User Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>
      <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome back!</h2>
          <p className="text-blue-200 text-sm">{currentUser?.email}</p>
          {errorMessage && <p className="text-red-400 text-sm mt-2">{errorMessage}</p>}
        </div>
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleCheckIn}
              disabled={isLoading || !!currentSessionId}
              className={`group relative ${isLoading || !!currentSessionId ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'} text-white font-semibold py-4 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
            >
              <span>{isLoading ? 'Loading...' : 'Check In'}</span>
            </button>
            <button
              onClick={handleCheckOut}
              disabled={!currentSessionId || isLoading}
              className={`group relative ${currentSessionId && !isLoading ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700' : 'bg-gray-500 cursor-not-allowed'} text-white font-semibold py-4 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
            >
              <span>{isLoading ? 'Loading...' : 'Check Out'}</span>
            </button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <h3 className="text-white font-semibold mb-3">⏱️ Today's Time Tracking</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-blue-200">Check-In:</span><span className="text-white font-mono">{formatTime(checkInTime)}</span></div>
              <div className="flex justify-between"><span className="text-blue-200">Check-Out:</span><span className="text-white font-mono">{formatTime(checkOutTime)}</span></div>
              <div className="flex justify-between"><span className="text-blue-200">Hours:</span><span className="text-white font-mono">{calculateHours(checkInTime, checkOutTime)}</span></div>
              <div className="flex justify-between"><span className="text-blue-200">Status:</span><span className={`font-mono ${currentSessionId ? 'text-green-400' : 'text-gray-400'}`}>{currentSessionId ? 'Checked In' : 'Not Active'}</span></div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <h3 className="text-white font-semibold mb-3">📊 My History</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {sessionHistory.length > 0 ? (
                sessionHistory.map((session) => (
                  <div key={session._id} className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium text-sm">{formatDate(session.checkIn)}</span>
                      {session.checkIn && new Date(session.checkIn).toISOString().split('T')[0] === getTodayKey() && <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Today</span>}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div><span className="text-blue-200">In: </span><span className="text-white font-mono">{formatTime(session.checkIn ? new Date(session.checkIn) : null)}</span></div>
                      <div><span className="text-blue-200">Out: </span><span className="text-white font-mono">{formatTime(session.checkOut ? new Date(session.checkOut) : null)}</span></div>
                      <div><span className="text-blue-200">Hours: </span><span className="text-white font-mono">{session.checkIn && session.checkOut ? calculateHours(new Date(session.checkIn), new Date(session.checkOut)) : 'N/A'}</span></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-blue-200 text-sm text-center py-4">No history available</p>
              )}
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-2xl transition-all duration-300 border border-white/20">
          Logout
        </button>
      </div>
    </div>
  );
}
























'use client';

import { useState, useEffect } from 'react';

interface UserData {
  _id: string;
  username: string;
  email: string;
  role: 'Admin' | 'User';
  createdAt?: string;
}

interface SessionData {
  _id: string;
  userId: string;
  checkIn?: string;
  checkOut?: string | null;
  createdAt?: string;
  userName?: string;
}

interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: 'Admin' | 'User';
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminTimeTracker() {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<'Admin' | 'User'>('User');
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'reports'>('dashboard');
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Signup states
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'Admin' | 'User'>('User');

  // User management states
  const [users, setUsers] = useState<UserData[]>([]);
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Admin' | 'User'>('User');

  // Time tracking states
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<SessionData[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [allUserSessions, setAllUserSessions] = useState<SessionData[]>([]);

  const getTodayKey = () => new Date().toISOString().split('T')[0];

  // Helper function to safely create Date objects
  const safeCreateDate = (dateString?: string): Date | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  // Helper function to validate date strings
  const isValidDateString = (dateString?: string): boolean => {
    if (!dateString) return false;
    return !isNaN(new Date(dateString).getTime());
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');

    if (savedToken && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user && user._id && user.role) {
          setAuthToken(savedToken);
          setCurrentUser(user);
          setLoggedIn(true);

          if (user.role === 'User') {
            loadUserData(user._id).catch((error) => {
              console.error('Load user data error:', error);
              setErrorMessage('Failed to load user data');
            });
          } else if (user.role === 'Admin') {
            Promise.all([loadAllUserSessions(), loadAllUsers()]).catch((error) => {
              console.error('Load admin data error:', error);
              setErrorMessage('Failed to load admin data');
            });
          }
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error('Parse localStorage error:', error);
        handleLogout();
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser && authToken) {
      if (currentUser.role === 'User') {
        loadUserData(currentUser._id).catch((error) => {
          console.error('Sync user data error:', error);
          setErrorMessage('Failed to sync user data');
        });
      } else if (currentUser.role === 'Admin') {
        Promise.all([loadAllUserSessions(), loadAllUsers()]).catch((error) => {
          console.error('Sync admin data error:', error);
          setErrorMessage('Failed to sync admin data');
        });
      }
    }
  }, [currentUser, authToken]);

  const loadAllUsers = async () => {
    if (!authToken) {
      setErrorMessage('No authentication token available');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/access-control/users`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok) throw new Error(`Failed to fetch users: ${response.statusText}`);
      const data = await response.json();
      if (Array.isArray(data)) setUsers(data);
      else throw new Error('Unexpected response format');
    } catch (error) {
      console.error('Load users error:', error);
      setErrorMessage('Failed to load users');
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/access-control/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword, role: loginRole }),
      });
      const data: AuthResponse = await response.json();
      if (response.ok && data.token && data.user) {
        const userData: UserData = {
          _id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          role: data.user.role,
        };
        setCurrentUser(userData);
        setAuthToken(data.token);
        setLoggedIn(true);
        setLoginEmail('');
        setLoginPassword('');

        localStorage.setItem('authToken', data.token);
        localStorage.setItem('currentUser', JSON.stringify(userData));

        if (userData.role === 'User') await loadUserData(userData._id);
        else if (userData.role === 'Admin') await Promise.all([loadAllUserSessions(), loadAllUsers()]);
      } else setErrorMessage(data.message || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Login failed. Please try again.');
    }
    setIsLoading(false);
  };

  const handleSignup = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/access-control/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: signupUsername, email: signupEmail, password: signupPassword, role: signupRole }),
      });
      const data = await response.json();
      if (response.ok) {
        setErrorMessage('Signup successful! You can now login.');
        setIsSignupMode(false);
        setSignupUsername('');
        setSignupEmail('');
        setSignupPassword('');
        setSignupRole('User');
      } else setErrorMessage(data.message || 'Signup failed');
    } catch (error) {
      console.error('Signup error:', error);
      setErrorMessage('Signup failed. Please try again.');
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    setLoggedIn(false);
    setCheckInTime(null);
    setCheckOutTime(null);
    setSessionHistory([]);
    setCurrentSessionId(null);
    setActiveTab('dashboard');
    setUsers([]);
    setAllUserSessions([]);
    setErrorMessage(null);

    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  };

  const addNewUser = async () => {
    if (!newUserUsername || !newUserEmail || !newUserPassword) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    if (!authToken) {
      setErrorMessage('No authentication token available');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/access-control/signup`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ username: newUserUsername, email: newUserEmail, password: newUserPassword, role: newUserRole }),
      });
      const data = await response.json();
      if (response.ok && data.user) {
        const newUser: UserData = {
          _id: data.user._id || data.user.id,
          username: data.user.username || newUserUsername,
          email: data.user.email || newUserEmail,
          role: data.user.role || newUserRole,
          createdAt: data.user.createdAt || new Date().toISOString(),
        };
        // Reload the full user list to ensure the UI reflects the latest data
        await loadAllUsers();
        setNewUserUsername('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserRole('User');
        setErrorMessage('User added successfully!');
      } else setErrorMessage(data.message || 'Failed to add user');
    } catch (error) {
      console.error('Add user error:', error);
      setErrorMessage('Failed to add user');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!authToken) {
      setErrorMessage('No authentication token available');
      return;
    }
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/access-control/users/${userId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (response.ok) {
          setUsers(users.filter((u) => u._id !== userId));
          setAllUserSessions(allUserSessions.filter((s) => s.userId !== userId));
        } else throw new Error('Failed to delete user');
      } catch (error) {
        console.error('Delete user error:', error);
        setErrorMessage('Failed to delete user');
      }
    }
  };

  const loadAllUserSessions = async () => {
    if (!authToken) {
      setErrorMessage('No authentication token available');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/session`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok) throw new Error(`Failed to fetch sessions: ${response.statusText}`);
      const sessions: SessionData[] = await response.json();
      if (Array.isArray(sessions)) {
        const enrichedSessions = sessions
          .filter((session) => isValidDateString(session.checkIn))
           .map((session) => ({
            ...session,
            userName: users.find((u) => u._id === session.userId)?.username ||  'unknown',
          }));
        setAllUserSessions(enrichedSessions);
      } else throw new Error('Unexpected response format');
    } catch (error) {
      console.error('Load sessions error:', error);
      setErrorMessage('Failed to load sessions');
    }
  };

  const loadUserData = async (userId: string) => {
    if (!authToken) {
      setErrorMessage('No authentication token available');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/session`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok) throw new Error(`Failed to fetch user sessions: ${response.statusText}`);
      const sessions: SessionData[] = await response.json();
      if (Array.isArray(sessions)) {
        const userSessions = sessions.filter((s) => s.userId === userId && isValidDateString(s.checkIn));
        // setSessionHistory(userSessions);
        setSessionHistory(userSessions.map((session) => ({
        ...session,
        userName: users.find((u) => u._id === session.userId)?.username || session.userName || 'Unknown',
      })));
        const today = getTodayKey();
        const todaySession = userSessions.find((s) => s.checkIn && new Date(s.checkIn).toISOString().split('T')[0] === today);

        if (todaySession && todaySession.checkIn) {
          const checkInDate = safeCreateDate(todaySession.checkIn);
          const checkOutDate = todaySession.checkOut ? safeCreateDate(todaySession.checkOut) : null;
          
          setCheckInTime(checkInDate);
          setCheckOutTime(checkOutDate);
          setCurrentSessionId(todaySession._id);
        } else {
          setCheckInTime(null);
          setCheckOutTime(null);
          setCurrentSessionId(null);
        }
      } else throw new Error('Unexpected response format');
    } catch (error) {
      console.error('Load user data error:', error);
      setErrorMessage('Failed to load user data');
    }
  };

  const handleCheckIn = async () => {
    if (!currentUser || !authToken) {
      setErrorMessage('Not authenticated');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/session/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ userId: currentUser._id }),
      });
      const data = await response.json();
      if (response.ok && data._id && data.checkIn) {
        const checkInDate = safeCreateDate(data.checkIn);
        if (checkInDate) {
          const newSession: SessionData = {
            ...data,
            checkIn: checkInDate.toISOString(),
            checkOut: null,
            userName: currentUser.email,
          };
          setCheckInTime(checkInDate);
          setCurrentSessionId(newSession._id);
          setSessionHistory([newSession, ...sessionHistory]);
          setAllUserSessions([newSession, ...allUserSessions]);
          await loadAllUserSessions();
        } else throw new Error('Invalid check-in date received');
      } else setErrorMessage(data.message || 'Check-in failed');
    } catch (error) {
      console.error('Check-in error:', error);
      setErrorMessage('Check-in failed');
    }
    setIsLoading(false);
  };

  const handleCheckOut = async () => {
    if (!currentUser || !currentSessionId || !authToken) {
      setErrorMessage('Not authenticated or no active session');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/session/checkout/${currentSessionId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();
      if (response.ok && data._id && data.checkOut) {
        const checkOutDate = safeCreateDate(data.checkOut);
        if (checkOutDate) {
          const updatedSession: SessionData = {
            ...data,
            checkOut: checkOutDate.toISOString(),
            userName: currentUser.email,
          };
          setCheckOutTime(checkOutDate);
          setSessionHistory((prev) =>
            prev.map((s) => (s._id === currentSessionId ? { ...s, checkOut: updatedSession.checkOut } : s))
          );
          setAllUserSessions((prev) =>
            prev.map((s) => (s._id === currentSessionId ? { ...s, checkOut: updatedSession.checkOut } : s))
          );
          setCurrentSessionId(null);
          await loadAllUserSessions();
        } else throw new Error('Invalid check-out date received');
      } else setErrorMessage(data.message || 'Check-out failed');
    } catch (error) {
      console.error('Check-out error:', error);
      setErrorMessage('Check-out failed');
    }
    setIsLoading(false);
  };

  const formatDate = (dateString?: string) => {
    if (!isValidDateString(dateString)) return 'N/A';
    return new Date(dateString!).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (time: Date | string | null | undefined) => {
    if (!time) return 'N/A';
    
    let date: Date;
    if (typeof time === 'string') {
      if (!isValidDateString(time)) return 'N/A';
      date = new Date(time);
    } else {
      date = time;
    }
    
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const calculateHours = (checkIn: Date | string | null | undefined, checkOut: Date | string | null | undefined) => {
    if (!checkIn || !checkOut) return 'N/A';
    
    let checkInDate: Date;
    let checkOutDate: Date;
    
    if (typeof checkIn === 'string') {
      if (!isValidDateString(checkIn)) return 'N/A';
      checkInDate = new Date(checkIn);
    } else {
      checkInDate = checkIn;
    }
    
    if (typeof checkOut === 'string') {
      if (!isValidDateString(checkOut)) return 'N/A';
      checkOutDate = new Date(checkOut);
    } else {
      checkOutDate = checkOut;
    }
    
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) return 'N/A';
    
    const diffMs = checkOutDate.getTime() - checkInDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours >= 0 ? `${diffHours.toFixed(1)}h` : 'N/A';
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>
        <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-md">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white">Time Tracker</h2>
            <p className="text-blue-200">{isSignupMode ? 'Create your account' : 'Sign in to your account'}</p>
            {errorMessage && <p className="text-red-400 text-sm">{errorMessage}</p>}
            <div className="space-y-4">
              {isSignupMode && (
                <input
                  type="text"
                  placeholder="Username"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={isSignupMode ? signupEmail : loginEmail}
                onChange={(e) => (isSignupMode ? setSignupEmail(e.target.value) : setLoginEmail(e.target.value))}
                className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                onKeyDown={(e) => e.key === 'Enter' && (isSignupMode ? handleSignup() : handleLogin())}
              />
              <input
                type="password"
                placeholder="Password"
                value={isSignupMode ? signupPassword : loginPassword}
                onChange={(e) => (isSignupMode ? setSignupPassword(e.target.value) : setLoginPassword(e.target.value))}
                className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                onKeyDown={(e) => e.key === 'Enter' && (isSignupMode ? handleSignup() : handleLogin())}
              />
              <select
                value={isSignupMode ? signupRole : loginRole}
                onChange={(e) => (isSignupMode ? setSignupRole(e.target.value as 'Admin' | 'User') : setLoginRole(e.target.value as 'Admin' | 'User'))}
                className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              >
                <option value="User" className="bg-gray-800">User</option>
                <option value="Admin" className="bg-gray-800">Admin</option>
              </select>
              <button
                onClick={isSignupMode ? handleSignup : handleLogin}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 rounded-2xl transition-all duration-300"
              >
                {isLoading ? (isSignupMode ? 'Creating Account...' : 'Signing In...') : isSignupMode ? 'Sign Up' : 'Sign In'}
              </button>
              <button
                onClick={() => {
                  setIsSignupMode(!isSignupMode);
                  setErrorMessage(null);
                }}
                className="w-full text-blue-300 hover:text-white font-medium transition-colors"
              >
                {isSignupMode ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser?.role === 'Admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-blue-200">Welcome, {currentUser.username || currentUser.email}</p>
              </div>
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-colors">
                Logout
              </button>
            </div>
            {errorMessage && <p className="text-red-400 text-sm mt-4">{errorMessage}</p>}
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-2 mb-6">
            <div className="flex space-x-2">
              {['dashboard', 'users', 'reports'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as 'dashboard' | 'users' | 'reports')}
                  className={`flex-1 py-3 px-4 rounded-2xl font-medium transition-all duration-300 ${
                    activeTab === tab ? 'bg-blue-500 text-white shadow-lg' : 'text-blue-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab === 'dashboard' ? '📊 Dashboard' : tab === 'users' ? '👥 Manage Users' : '📋 All Reports'}
                </button>
              ))}
            </div>
          </div>
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center">👥 Total Users</h3>
                <p className="text-3xl font-bold text-white">{users.filter((u) => u.role === 'User').length}</p>
                <p className="text-blue-200 text-sm mt-2">Active employees</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center">✅ Today's Check-ins</h3>
                <p className="text-3xl font-bold text-green-400">
                  {allUserSessions.filter((s) => s.checkIn && new Date(s.checkIn).toISOString().split('T')[0] === getTodayKey()).length}
                </p>
                <p className="text-blue-200 text-sm mt-2">Users checked in today</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center">🏃‍♂️ Currently Active</h3>
                <p className="text-3xl font-bold text-yellow-400">
                  {allUserSessions.filter((s) => s.checkIn && !s.checkOut && new Date(s.checkIn).toISOString().split('T')[0] === getTodayKey()).length}
                </p>
                <p className="text-blue-200 text-sm mt-2">Users currently working</p>
              </div>
            </div>
          )}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
                <h3 className="text-white font-semibold mb-4">➕ Add New User</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <input
                    type="text"
                    placeholder="Username"
                    value={newUserUsername}
                    onChange={(e) => setNewUserUsername(e.target.value)}
                    className="p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200"
                    onKeyDown={(e) => e.key === 'Enter' && addNewUser()}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200"
                    onKeyDown={(e) => e.key === 'Enter' && addNewUser()}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200"
                    onKeyDown={(e) => e.key === 'Enter' && addNewUser()}
                  />
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as 'Admin' | 'User')}
                    className="p-3 bg-white/10 border border-white/20 rounded-xl text-white"
                  >
                    <option value="User" className="bg-gray-800">User</option>
                    <option value="Admin" className="bg-gray-800">Admin</option>
                  </select>
                  <button onClick={addNewUser} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors">
                    Add User
                  </button>
                </div>
                {errorMessage && <p className="text-red-400 text-sm mt-4">{errorMessage}</p>}
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
                <h3 className="text-white font-semibold mb-4">👥 All Users</h3>
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user._id} className="bg-white/5 rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium">{user.username || user.email}</p>
                        <p className="text-blue-200 text-sm">{user.email} • Role: {user.role} • Created: {formatDate(user.createdAt)}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'Admin' ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'}`}>
                          {user.role}
                        </span>
                        {user.email !== currentUser?.email && (
                          <button onClick={() => deleteUser(user._id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-xs transition-colors">
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'reports' && (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
              <h3 className="text-white font-semibold mb-6">📋 All User Sessions</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {allUserSessions.length > 0 ? (
                  allUserSessions
                    .sort((a, b) => (b.checkIn && a.checkIn ? new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime() : 0))
                    .map((session) => (
                      <div key={session._id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-white font-medium">{session.userName}</p>
                            <p className="text-blue-200 text-sm">{formatDate(session.checkIn)}</p>
                          </div>
                          <div className="flex gap-2">
                            {session.checkIn && new Date(session.checkIn).toISOString().split('T')[0] === getTodayKey() && (
                              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Today</span>
                            )}
                            {session.checkIn && !session.checkOut && (
                              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Active</span>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-blue-200">Check In: </span>
                            <span className="text-white font-mono">{formatTime(session.checkIn)}</span>
                          </div>
                          <div>
                            <span className="text-blue-200">Check Out: </span>
                            <span className="text-white font-mono">{formatTime(session.checkOut)}</span>
                          </div>
                          <div>
                            <span className="text-blue-200">Hours: </span>
                            <span className="text-white font-mono">{calculateHours(session.checkIn, session.checkOut)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-blue-200 text-center py-8">No session data available</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>
      <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome back!</h2>
          <p className="text-blue-200 text-sm">{currentUser?.email}</p>
          {errorMessage && <p className="text-red-400 text-sm mt-2">{errorMessage}</p>}
        </div>
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleCheckIn}
              disabled={isLoading || !!currentSessionId}
              className={`group relative ${isLoading || !!currentSessionId ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'} text-white font-semibold py-4 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
            >
              <span>{isLoading ? 'Loading...' : 'Check In'}</span>
            </button>
            <button
              onClick={handleCheckOut}
              disabled={!currentSessionId || isLoading}
              className={`group relative ${currentSessionId && !isLoading ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700' : 'bg-gray-500 cursor-not-allowed'} text-white font-semibold py-4 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
            >
              <span>{isLoading ? 'Loading...' : 'Check Out'}</span>
            </button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <h3 className="text-white font-semibold mb-3">⏱️ Today's Time Tracking</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-200">Check-In:</span>
                <span className="text-white font-mono">{formatTime(checkInTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Check-Out:</span>
                <span className="text-white font-mono">{formatTime(checkOutTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Hours:</span>
                <span className="text-white font-mono">{calculateHours(checkInTime, checkOutTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Status:</span>
                <span className={`font-mono ${currentSessionId ? 'text-green-400' : 'text-gray-400'}`}>
                  {currentSessionId ? 'Checked In' : 'Not Active'}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <h3 className="text-white font-semibold mb-3">📊 My History</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {sessionHistory.length > 0 ? (
                sessionHistory.map((session) => (
                  <div key={session._id} className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium text-sm">{formatDate(session.checkIn)}</span>
                      {session.checkIn && new Date(session.checkIn).toISOString().split('T')[0] === getTodayKey() && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Today</span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-blue-200">In: </span>
                        <span className="text-white font-mono">{formatTime(session.checkIn)}</span>
                      </div>
                      <div>
                        <span className="text-blue-200">Out: </span>
                        <span className="text-white font-mono">{formatTime(session.checkOut)}</span>
                      </div>
                      <div>
                        <span className="text-blue-200">Hours: </span>
                        <span className="text-white font-mono">{calculateHours(session.checkIn, session.checkOut)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-blue-200 text-sm text-center py-4">No history available</p>
              )}
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-2xl transition-all duration-300 border border-white/20">
          Logout
        </button>
      </div>
    </div>
  );
}
