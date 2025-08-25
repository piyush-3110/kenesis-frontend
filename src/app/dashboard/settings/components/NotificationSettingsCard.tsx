// 'use client';

// import React from 'react';
// import { useSettingsStore } from '../store/useSettingsStore';
// import GradientBox from './GradientBox';

// /**
//  * CustomSwitch Component
//  * Custom toggle switch with gradient styling
//  */
// interface CustomSwitchProps {
//   checked: boolean;
//   onCheckedChange: (checked: boolean) => void;
//   disabled?: boolean;
// }

// const CustomSwitch: React.FC<CustomSwitchProps> = ({
//   checked,
//   onCheckedChange,
//   disabled = false
// }) => {
//   return (
//     <button
//       type="button"
//       disabled={disabled}
//       onClick={() => onCheckedChange(!checked)}
//       className={`
//         relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
//         ${checked ? 'bg-blue-500' : 'bg-gray-600'}
//         ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
//       `}
//     >
//       <span
//         className={`
//           inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out
//           ${checked ? 'translate-x-6' : 'translate-x-1'}
//         `}
//       />
//     </button>
//   );
// };

// /**
//  * NotificationSettingsCard Component
//  * Handles notification preferences with toggle switches
//  */
// // const NotificationSettingsCard: React.FC = () => {
// //   const { notifications, toggleNotification } = useSettingsStore();

// //   const notificationOptions = [
// //     {
// //       key: 'emailReports' as const,
// //       label: 'Email Reports',
// //       description: 'Get weekly reports about your courses and earnings',
// //     },
// //     {
// //       key: 'pushNotifications' as const,
// //       label: 'Push Notifications',
// //       description: 'Receive notifications about new students and messages',
// //     },
// //     {
// //       key: 'soundEnabled' as const,
// //       label: 'Sound',
// //       description: 'Play sounds for notifications',
// //     },
// //     {
// //       key: 'vibrationEnabled' as const,
// //       label: 'Vibration',
// //       description: 'Enable vibration for mobile notifications',
// //     },
// //     {
// //       key: 'marketingEmails' as const,
// //       label: 'Marketing Emails',
// //       description: 'Receive emails about new features and promotions',
// //     },
// //     {
// //       key: 'securityAlerts' as const,
// //       label: 'Security Alerts',
// //       description: 'Get notified about security-related activities',
// //     },
// //   ];

//   return (
//     <GradientBox>
//       <div className="p-6">
//         {/* Header */}
//         <div className="mb-6">
//           <h2
//             className="text-white font-medium mb-2"
//             style={{
//               fontFamily: 'Inter',
//               fontSize: '18px',
//               fontWeight: 500,
//               lineHeight: '140%',
//             }}
//           >
//             Notification Settings
//           </h2>
//           <p
//             className="text-gray-400"
//             style={{
//               fontFamily: 'Inter',
//               fontSize: '14.03px',
//               fontWeight: 400,
//               lineHeight: '20.58px',
//             }}
//           >
//             Choose how you want to be notified about updates and activities.
//           </p>
//         </div>

//         {/* Notification Options */}
//         <div className="space-y-6">
//           {notificationOptions.map((option) => (
//             <div key={option.key} className="flex items-start justify-between">
//               <div className="flex-1 min-w-0 mr-4">
//                 <label
//                   className="block text-white font-medium cursor-pointer"
//                   style={{
//                     fontFamily: 'Inter',
//                     fontSize: '14.03px',
//                     fontWeight: 500,
//                   }}
//                   onClick={() => toggleNotification(option.key)}
//                 >
//                   {option.label}
//                 </label>
//                 <p
//                   className="text-gray-400 mt-1"
//                   style={{
//                     fontFamily: 'Inter',
//                     fontSize: '13px',
//                     fontWeight: 400,
//                     lineHeight: '18px',
//                   }}
//                 >
//                   {option.description}
//                 </p>
//               </div>

//               <div className="flex-shrink-0">
//                 <CustomSwitch
//                   checked={notifications[option.key]}
//                   onCheckedChange={(checked) => {
//                     toggleNotification(option.key);
//                   }}
//                 />
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Additional Settings */}
//         <div className="mt-8 pt-6 border-t border-gray-700/30">
//           <div className="flex items-center justify-between">
//             <div>
//               <h3
//                 className="text-white font-medium"
//                 style={{
//                   fontFamily: 'Inter',
//                   fontSize: '14.03px',
//                   fontWeight: 500,
//                 }}
//               >
//                 Do Not Disturb
//               </h3>
//               <p
//                 className="text-gray-400 mt-1"
//                 style={{
//                   fontFamily: 'Inter',
//                   fontSize: '13px',
//                   fontWeight: 400,
//                 }}
//               >
//                 Pause all notifications temporarily
//               </p>
//             </div>

//             <CustomSwitch
//               checked={false}
//               onCheckedChange={(checked) => {
//                 // In real implementation, this would toggle DND mode
//                 console.log('Do Not Disturb:', checked);
//               }}
//             />
//           </div>
//         </div>
//       </div>
//     </GradientBox>
//   );
// };

// export default NotificationSettingsCard;
