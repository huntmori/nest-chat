<template>
  <div class="room-detail-container">
    <header class="header">
      <button @click="handleBack" class="btn-back">← 뒤로</button>
      <div v-if="room" class="room-title">
        <h1>{{ room.name }}</h1>
        <span class="member-count"
          >👤 {{ members.length }} / {{ room.max_users }}</span
        >
      </div>
      <button @click="handleLeaveRoom" class="btn-leave">나가기</button>
    </header>

    <div v-if="loading" class="loading">로딩중...</div>

    <div v-else-if="room" class="room-content">
      <div class="room-info-panel">
        <h3>방 정보</h3>
        <div class="info-item">
          <strong>방장:</strong> {{ room.owner.nickname }}
        </div>
        <div class="info-item">
          <strong>타입:</strong>
          <span :class="['badge', room.room_type.toLowerCase()]">
            {{ room.room_type }}
          </span>
        </div>
        <div class="info-item">
          <strong>입장 방식:</strong>
          {{ getRoomJoinTypeLabel(room.room_join_type) }}
        </div>
        <div class="info-item">
          <strong>생성일:</strong> {{ formatDate(room.createdAt) }}
        </div>

        <h3 style="margin-top: 30px">참여자 ({{ members.length }})</h3>
        <div class="members-list">
          <div v-for="member in members" :key="member.idx" class="member-item">
            <span class="member-name">{{ member.nickname }}</span>
            <span :class="['member-role', member.role.toLowerCase()]">
              {{ getRoleLabel(member.role) }}
            </span>
          </div>
        </div>
      </div>

      <div class="chat-panel">
        <div class="chat-info">
          <p>💬 채팅 기능은 WebSocket 연결 후 사용 가능합니다</p>
          <p class="text-muted">현재는 방 정보만 표시됩니다</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { roomService, type Room } from '@/services/room';

const router = useRouter();
const route = useRoute();

const room = ref<Room | null>(null);
const members = ref<any[]>([]);
const loading = ref(false);

const loadRoomData = async () => {
  loading.value = true;
  try {
    const roomId = route.params.id as string;
    const [roomData, membersData] = await Promise.all([
      roomService.getRoomById(roomId),
      roomService.getRoomMembers(roomId),
    ]);
    room.value = roomData;
    members.value = membersData;
  } catch (err) {
    console.error('Failed to load room data:', err);
    alert('방 정보를 불러오는데 실패했습니다');
    router.push('/rooms');
  } finally {
    loading.value = false;
  }
};

const handleBack = () => {
  router.push('/rooms');
};

const handleLeaveRoom = async () => {
  if (!confirm('정말 이 방을 나가시겠습니까?')) return;

  try {
    const roomId = route.params.id as string;
    await roomService.leaveRoom(roomId);
    router.push('/rooms');
  } catch (err: any) {
    alert(err.response?.data?.message || '방 나가기에 실패했습니다');
  }
};

const getRoomJoinTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    OPEN: '누구나',
    PASSWORD: '비밀번호',
    INVITE: '초대',
  };
  return labels[type] || type;
};

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    OWNER: '방장',
    MANAGER: '관리자',
    MEMBER: '멤버',
  };
  return labels[role] || role;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR');
};

onMounted(() => {
  loadRoomData();
});
</script>

<style scoped>
.room-detail-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.room-title {
  flex: 1;
  text-align: center;
}

.room-title h1 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.member-count {
  color: #666;
  font-size: 14px;
}

.btn-back,
.btn-leave {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back {
  background: #6c757d;
  color: white;
}

.btn-leave {
  background: #dc3545;
  color: white;
}

.btn-back:hover,
.btn-leave:hover {
  transform: translateY(-2px);
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 18px;
}

.room-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  padding: 20px;
  height: calc(100vh - 84px);
}

.room-info-panel {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.room-info-panel h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 18px;
  border-bottom: 2px solid #667eea;
  padding-bottom: 10px;
}

.info-item {
  margin-bottom: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 5px;
}

.info-item strong {
  display: block;
  margin-bottom: 5px;
  color: #555;
  font-size: 12px;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.badge.public {
  background: #e3f2fd;
  color: #1976d2;
}

.badge.private {
  background: #fce4ec;
  color: #c2185b;
}

.members-list {
  max-height: 400px;
  overflow-y: auto;
}

.member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  background: #f8f9fa;
  border-radius: 5px;
  transition: background 0.2s;
}

.member-item:hover {
  background: #e9ecef;
}

.member-name {
  font-weight: 500;
  color: #333;
}

.member-role {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}

.member-role.owner {
  background: #ffd700;
  color: #333;
}

.member-role.manager {
  background: #87ceeb;
  color: #333;
}

.member-role.member {
  background: #d3d3d3;
  color: #666;
}

.chat-panel {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  text-align: center;
}

.chat-info p {
  margin: 10px 0;
  font-size: 18px;
  color: #333;
}

.text-muted {
  color: #999 !important;
  font-size: 14px !important;
}

@media (max-width: 768px) {
  .room-content {
    grid-template-columns: 1fr;
    height: auto;
  }

  .room-info-panel {
    order: 2;
  }

  .chat-panel {
    order: 1;
    min-height: 400px;
  }
}
</style>
