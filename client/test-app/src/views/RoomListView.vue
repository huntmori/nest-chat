<template>
  <div class="room-list-container">
    <header class="header">
      <h1>채팅방 목록</h1>
      <div class="header-actions">
        <button @click="showCreateModal = true" class="btn-primary">
          방 만들기
        </button>
        <button @click="handleLogout" class="btn-secondary">로그아웃</button>
      </div>
    </header>

    <div class="room-grid">
      <div v-if="loading" class="loading">로딩중...</div>
      <div v-else-if="rooms.length === 0" class="empty-state">
        채팅방이 없습니다. 새로운 방을 만들어보세요!
      </div>
      <div v-else v-for="room in rooms" :key="room.uuid" class="room-card">
        <div class="room-header">
          <h3>{{ room.name }}</h3>
          <span :class="['room-type', room.room_type.toLowerCase()]">
            {{ room.room_type }}
          </span>
        </div>
        <div class="room-info">
          <p>👤 {{ room.currentUsers }} / {{ room.max_users }}</p>
          <p>👨‍💼 {{ room.owner.nickname }}</p>
          <p v-if="room.hasPassword">🔒 비밀번호 필요</p>
        </div>
        <div class="room-actions">
          <button @click="handleJoinRoom(room)" class="btn-join">입장</button>
          <button
            v-if="canDeleteRoom(room)"
            @click="handleDeleteRoom(room.uuid)"
            class="btn-delete"
          >
            삭제
          </button>
        </div>
      </div>
    </div>

    <!-- Create Room Modal -->
    <div
      v-if="showCreateModal"
      class="modal-overlay"
      @click="showCreateModal = false"
    >
      <div class="modal" @click.stop>
        <h2>채팅방 만들기</h2>
        <form @submit.prevent="handleCreateRoom">
          <div class="form-group">
            <label>방 이름</label>
            <input
              v-model="createForm.name"
              required
              placeholder="방 이름을 입력하세요"
            />
          </div>

          <div class="form-group">
            <label>최대 인원</label>
            <input
              v-model.number="createForm.max_users"
              type="number"
              min="2"
              max="100"
              required
            />
          </div>

          <div class="form-group">
            <label>방 타입</label>
            <select v-model="createForm.room_type" required>
              <option value="PUBLIC">공개</option>
              <option value="PRIVATE">비공개</option>
            </select>
          </div>

          <div class="form-group">
            <label>입장 타입</label>
            <select v-model="createForm.room_join_type" required>
              <option value="OPEN">누구나</option>
              <option value="PASSWORD">비밀번호</option>
            </select>
          </div>

          <div
            v-if="createForm.room_join_type === 'PASSWORD'"
            class="form-group"
          >
            <label>비밀번호</label>
            <input v-model="createForm.password" type="password" required />
          </div>

          <div v-if="createError" class="error-message">{{ createError }}</div>

          <div class="modal-actions">
            <button
              type="button"
              @click="showCreateModal = false"
              class="btn-secondary"
            >
              취소
            </button>
            <button type="submit" class="btn-primary" :disabled="createLoading">
              {{ createLoading ? '생성중...' : '만들기' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Join Room Password Modal -->
    <div
      v-if="showPasswordModal"
      class="modal-overlay"
      @click="showPasswordModal = false"
    >
      <div class="modal" @click.stop>
        <h2>비밀번호 입력</h2>
        <form @submit.prevent="confirmJoinRoom">
          <div class="form-group">
            <label>비밀번호</label>
            <input
              v-model="roomPassword"
              type="password"
              required
              placeholder="비밀번호"
            />
          </div>

          <div v-if="joinError" class="error-message">{{ joinError }}</div>

          <div class="modal-actions">
            <button
              type="button"
              @click="showPasswordModal = false"
              class="btn-secondary"
            >
              취소
            </button>
            <button type="submit" class="btn-primary" :disabled="joinLoading">
              {{ joinLoading ? '입장중...' : '입장' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/auth';
import {
  roomService,
  RoomType,
  RoomJoinType,
  type Room,
} from '@/services/room';
import { jwtDecode } from 'jwt-decode';

const router = useRouter();

const rooms = ref<Room[]>([]);
const loading = ref(false);
const showCreateModal = ref(false);
const showPasswordModal = ref(false);
const selectedRoom = ref<Room | null>(null);
const roomPassword = ref('');

const createForm = ref({
  name: '',
  max_users: 10,
  room_type: 'PUBLIC' as RoomType,
  room_join_type: 'OPEN' as RoomJoinType,
  password: '',
});

const createError = ref('');
const createLoading = ref(false);
const joinError = ref('');
const joinLoading = ref(false);

const currentUserIdx = computed(() => {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  try {
    const decoded: any = jwtDecode(token);
    return decoded.sub; // JWT의 subject는 'sub' 필드에 저장됨
  } catch {
    return null;
  }
});

const canDeleteRoom = (room: Room) => {
  return room.owner.idx === currentUserIdx.value;
};

const loadRooms = async () => {
  loading.value = true;
  try {
    console.log('Loading rooms...');
    const data = await roomService.getRoomList();
    console.log('Room list response:', data);
    console.log('Rooms array:', data.rooms);
    rooms.value = data.rooms;
  } catch (err) {
    console.error('Failed to load rooms:', err);
    alert('채팅방 목록을 불러오는데 실패했습니다: ' + err);
  } finally {
    loading.value = false;
  }
};

const handleCreateRoom = async () => {
  createError.value = '';
  createLoading.value = true;

  try {
    const data = { ...createForm.value };
    if (data.room_join_type !== 'PASSWORD') {
      delete data.password;
    }

    await roomService.createRoom(data);
    showCreateModal.value = false;
    createForm.value = {
      name: '',
      max_users: 10,
      room_type: 'PUBLIC',
      room_join_type: 'OPEN',
      password: '',
    };
    await loadRooms();
  } catch (err: any) {
    createError.value = err.response?.data?.message || '방 생성에 실패했습니다';
  } finally {
    createLoading.value = false;
  }
};

const handleJoinRoom = async (room: Room) => {
  try {
    // 먼저 이미 입장한 방인지 확인
    const { isMember } = await roomService.checkMembership(room.uuid);

    if (isMember) {
      // 이미 입장한 방이면 바로 이동
      router.push(`/rooms/${room.uuid}`);
      return;
    }

    // 입장하지 않은 방이면 비밀번호 확인 후 join
    if (room.hasPassword) {
      selectedRoom.value = room;
      roomPassword.value = '';
      showPasswordModal.value = true;
    } else {
      await joinRoom(room.uuid);
    }
  } catch (err: any) {
    console.error('Error checking membership:', err);
    alert('방 정보를 확인하는데 실패했습니다');
  }
};

const confirmJoinRoom = async () => {
  if (selectedRoom.value) {
    await joinRoom(selectedRoom.value.uuid, roomPassword.value);
  }
};

const joinRoom = async (roomId: string, password?: string) => {
  joinError.value = '';
  joinLoading.value = true;

  try {
    await roomService.joinRoom(roomId, password);
    showPasswordModal.value = false;
    roomPassword.value = '';
    router.push(`/rooms/${roomId}`);
  } catch (err: any) {
    joinError.value = err.response?.data?.message || '입장에 실패했습니다';
  } finally {
    joinLoading.value = false;
  }
};

const handleDeleteRoom = async (roomId: string) => {
  if (!confirm('정말 이 방을 삭제하시겠습니까?')) return;

  try {
    await roomService.deleteRoom(roomId);
    await loadRooms();
  } catch (err: any) {
    alert(err.response?.data?.message || '삭제에 실패했습니다');
  }
};

const handleLogout = () => {
  authService.logout();
  router.push('/login');
};

onMounted(() => {
  loadRooms();
});
</script>

<style scoped>
.room-list-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header h1 {
  margin: 0;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.room-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.room-card:hover {
  transform: translateY(-5px);
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.room-header h3 {
  margin: 0;
  color: #333;
}

.room-type {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.room-type.public {
  background: #e3f2fd;
  color: #1976d2;
}

.room-type.private {
  background: #fce4ec;
  color: #c2185b;
}

.room-info {
  margin-bottom: 15px;
}

.room-info p {
  margin: 5px 0;
  color: #666;
  font-size: 14px;
}

.room-actions {
  display: flex;
  gap: 10px;
}

.btn-primary,
.btn-secondary,
.btn-join,
.btn-delete {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-join {
  flex: 1;
  background: #28a745;
  color: white;
}

.btn-delete {
  background: #dc3545;
  color: white;
}

.loading,
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 18px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #555;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.error-message {
  color: #e74c3c;
  margin-bottom: 15px;
  padding: 10px;
  background: #ffe6e6;
  border-radius: 5px;
  font-size: 14px;
}
</style>
