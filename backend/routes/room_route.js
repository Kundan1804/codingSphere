import express from 'express';
import {
  createRoom,
  joinRoom,
  getAllRooms,
  getUserRooms,
  getRoomUsers,
  leaveRoom,
  getRoomDetails,
  updateRoomCode,
  updateLanguage,
  updateTerminals,
  updateFileSelection,
  sendJoinRequest,
  getPendingJoinRequests,
  acceptJoinRequest
} from '../controllers/room_controller.js';
import { auth } from '../auth_backend.js';
import { createMessage, getRoomMessages } from '../controllers/message_controller.js';

const router = express.Router();

// Room routes
router.post('/', auth, createRoom);
router.get('/:roomId', auth, getRoomDetails);
router.get('/', auth, getAllRooms);
router.get('/user/:userId', auth, getUserRooms);
router.get('/:roomId/users', auth, getRoomUsers);
// 🔹 Join request APIs — put BEFORE `/:roomId`
router.post('/request-join/:roomId', auth, sendJoinRequest);
router.get('/:roomId/pending-requests', auth, getPendingJoinRequests);
router.post('/join-request/:requestId/accept', auth, acceptJoinRequest);

router.post('/:roomId/join', auth, joinRoom);
router.post('/:roomId/leave', auth, leaveRoom);
router.get('/:roomId/details', auth, getRoomDetails);
router.post('/:roomId/code', auth, updateRoomCode);
router.post('/:roomId/language', auth, updateLanguage);
router.post('/:roomId/terminals', auth, updateTerminals);
router.post('/:roomId/file-selection', auth, updateFileSelection);
router.post('/:roomId/messages', auth, createMessage);
router.get('/:roomId/messages', auth, getRoomMessages);
router.get('/debug/test', (req, res) => {
  res.send("Rooms router is working!");
});
export default router;
