
<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Users,
  ShieldCheck,
  Settings,
  Activity,
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserRound,
  CheckCircle,
  XCircle,
  Clock,
  Save,
  RotateCcw,
  Shield,
  Eye,
  Package,
  ClipboardList,
  FileText,
  Download,
  Filter,
  X,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'default',
  title: 'Administration',
})

useSeoMeta({
  title: 'Administration | ICAM',
  description: 'Manage ICAM users, roles, system settings, and activity logs.',
})

type UserRole = 'Admin' | 'Laboratory Custodian' | 'Student'
type UserStatus = 'Active' | 'Inactive'

interface SystemUser {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  lastActive: string
}

interface ActivityLog {
  id: string
  user: string
  action: string
  description: string
  date: string
  type: 'User' | 'Inventory' | 'Requisition' | 'System'
}

const activeSection = ref('users')
const searchQuery = ref('')
const roleFilter = ref('All Roles')
const statusFilter = ref('All Status')
const selectedUser = ref<SystemUser | null>(null)
const showUserModal = ref(false)
const showAddUserModal = ref(false)
const showSaveMessage = ref(false)

const sections = [
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'roles', label: 'Roles & Permissions', icon: ShieldCheck },
  { id: 'settings', label: 'System Settings', icon: Settings },
  { id: 'logs', label: 'Activity Logs', icon: Activity },
]

const users = ref<SystemUser[]>([
  {
    id: 'USR-001',
    name: 'System Administrator',
    email: 'admin@sdca.edu.ph',
    role: 'Admin',
    status: 'Active',
    lastActive: 'Today',
  },
  {
    id: 'USR-002',
    name: 'Laboratory Custodian',
    email: 'custodian@sdca.edu.ph',
    role: 'Laboratory Custodian',
    status: 'Active',
    lastActive: 'Today',
  },
  {
    id: 'USR-003',
    name: 'Juan Dela Cruz',
    email: 'juan.delacruz@sdca.edu.ph',
    role: 'Student',
    status: 'Active',
    lastActive: 'Yesterday',
  },
  {
    id: 'USR-004',
    name: 'Maria Santos',
    email: 'maria.santos@sdca.edu.ph',
    role: 'Student',
    status: 'Inactive',
    lastActive: '3 days ago',
  },
  {
    id: 'USR-005',
    name: 'Pedro Reyes',
    email: 'pedro.reyes@sdca.edu.ph',
    role: 'Student',
    status: 'Active',
    lastActive: '2 days ago',
  },
])

const activityLogs = ref<ActivityLog[]>([
  {
    id: 'LOG-001',
    user: 'System Administrator',
    action: 'User Management',
    description: 'Viewed the user management section',
    date: 'Today, 10:30 AM',
    type: 'User',
  },
  {
    id: 'LOG-002',
    user: 'Laboratory Custodian',
    action: 'Inventory Update',
    description: 'Updated equipment inventory information',
    date: 'Today, 9:15 AM',
    type: 'Inventory',
  },
  {
    id: 'LOG-003',
    user: 'System Administrator',
    action: 'Requisition Review',
    description: 'Reviewed a laboratory equipment requisition',
    date: 'Yesterday, 3:45 PM',
    type: 'Requisition',
  },
  {
    id: 'LOG-004',
    user: 'System Administrator',
    action: 'System Access',
    description: 'Accessed the administration page',
    date: 'Yesterday, 1:20 PM',
    type: 'System',
  },
])

const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const query = searchQuery.value.toLowerCase()

    const matchesSearch =
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query)

    const matchesRole =
      roleFilter.value === 'All Roles' || user.role === roleFilter.value

    const matchesStatus =
      statusFilter.value === 'All Status' || user.status === statusFilter.value

    return matchesSearch && matchesRole && matchesStatus
  })
})

const activeUsers = computed(
  () => users.value.filter((user) => user.status === 'Active').length,
)

const inactiveUsers = computed(
  () => users.value.filter((user) => user.status === 'Inactive').length,
)

const selectedSection = computed(
  () => sections.find((section) => section.id === activeSection.value),
)

const systemSettings = ref({
  systemName: 'ICAM',
  institution: 'St. Dominic College of Asia',
  emailNotifications: true,
  reservationNotifications: true,
  inventoryNotifications: true,
  maintenanceMode: false,
})

function openUserDetails(user: SystemUser) {
  selectedUser.value = { ...user }
  showUserModal.value = true
}

function toggleUserStatus(user: SystemUser) {
  user.status = user.status === 'Active' ? 'Inactive' : 'Active'
}

function saveSettings() {
  // Frontend demonstration only. Settings are not saved to a backend.
  showSaveMessage.value = true

  setTimeout(() => {
    showSaveMessage.value = false
  }, 2500)
}

function exportActivityLogs() {
  const headers = ['ID', 'User', 'Action', 'Description', 'Date', 'Type']

  const rows = activityLogs.value.map((log) => [
    log.id,
    log.user,
    log.action,
    log.description,
    log.date,
    log.type,
  ])

  const csv = [
    headers,
    ...rows,
  ]
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'icam-activity-logs.csv'
  link.click()

  URL.revokeObjectURL(url)
}

function resetSettings() {
  systemSettings.value = {
    systemName: 'ICAM',
    institution: 'St. Dominic College of Asia',
    emailNotifications: true,
    reservationNotifications: true,
    inventoryNotifications: true,
    maintenanceMode: false,
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <p class="mb-1 text-sm font-semibold uppercase tracking-wider text-emerald-500">
        System Administration
      </p>
      <h1 class="text-2xl font-bold">Administration</h1>
      <p class="mt-1 text-sm text-base-content/60">
        Manage system users, access permissions, settings, and system activities.
      </p>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body gap-3 p-5">
          <div class="flex items-center justify-between">
            <span class="text-sm text-base-content/60">Total Users</span>
            <div class="rounded-lg bg-primary/10 p-2 text-primary">
              <Users :size="20" />
            </div>
          </div>
          <div class="text-2xl font-bold">{{ users.length }}</div>
          <p class="text-xs text-base-content/50">Registered system accounts</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body gap-3 p-5">
          <div class="flex items-center justify-between">
            <span class="text-sm text-base-content/60">Active Users</span>
            <div class="rounded-lg bg-success/10 p-2 text-success">
              <CheckCircle :size="20" />
            </div>
          </div>
          <div class="text-2xl font-bold">{{ activeUsers }}</div>
          <p class="text-xs text-base-content/50">Currently active accounts</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body gap-3 p-5">
          <div class="flex items-center justify-between">
            <span class="text-sm text-base-content/60">Inactive Users</span>
            <div class="rounded-lg bg-warning/10 p-2 text-warning">
              <XCircle :size="20" />
            </div>
          </div>
          <div class="text-2xl font-bold">{{ inactiveUsers }}</div>
          <p class="text-xs text-base-content/50">Inactive system accounts</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body gap-3 p-5">
          <div class="flex items-center justify-between">
            <span class="text-sm text-base-content/60">System Roles</span>
            <div class="rounded-lg bg-info/10 p-2 text-info">
              <ShieldCheck :size="20" />
            </div>
          </div>
          <div class="text-2xl font-bold">3</div>
          <p class="text-xs text-base-content/50">Defined account roles</p>
        </div>
      </div>
    </div>

    <!-- Administration Navigation -->
    <div class="rounded-xl border border-base-300 bg-base-100 p-2">
      <div class="flex gap-2 overflow-x-auto">
        <button
          v-for="section in sections"
          :key="section.id"
          class="btn btn-sm shrink-0 gap-2"
          :class="activeSection === section.id ? 'btn-primary' : 'btn-ghost'"
          @click="activeSection = section.id"
        >
          <component :is="section.icon" :size="16" />
          {{ section.label }}
        </button>
      </div>
    </div>

    <!-- Section Heading -->
    <div>
      <h2 class="text-lg font-bold">
        {{ selectedSection?.label }}
      </h2>
      <p class="mt-1 text-sm text-base-content/60">
        <template v-if="activeSection === 'users'">
          View and manage registered accounts in the ICAM system.
        </template>
        <template v-else-if="activeSection === 'roles'">
          Review the available system roles and their access levels.
        </template>
        <template v-else-if="activeSection === 'settings'">
          Configure general system preferences and notification settings.
        </template>
        <template v-else>
          Review recorded system activities and administrative actions.
        </template>
      </p>
    </div>

    <!-- USER MANAGEMENT -->
    <section v-if="activeSection === 'users'" class="space-y-4">
      <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div class="relative w-full sm:max-w-sm">
          <Search
            :size="17"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search users..."
            class="input input-bordered w-full pl-10"
          />
        </div>

        <div class="flex flex-wrap gap-2">
          <select v-model="roleFilter" class="select select-bordered select-sm">
            <option>All Roles</option>
            <option>Admin</option>
            <option>Laboratory Custodian</option>
            <option>Student</option>
          </select>

          <select v-model="statusFilter" class="select select-bordered select-sm">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>

          <button
            class="btn btn-primary btn-sm"
            @click="showAddUserModal = true"
          >
            <Plus :size="16" />
            Add User
          </button>
        </div>
      </div>

      <div class="overflow-hidden rounded-xl border border-base-300 bg-base-100">
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Account ID</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Active</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>
                  <div class="flex items-center gap-3">
                    <div class="avatar placeholder">
                      <div class="w-10 rounded-full bg-base-300 text-base-content">
                        <UserRound :size="19" />
                      </div>
                    </div>
                    <div>
                      <p class="font-semibold">{{ user.name }}</p>
                      <p class="text-xs text-base-content/50">{{ user.email }}</p>
                    </div>
                  </div>
                </td>

                <td class="font-mono text-xs">{{ user.id }}</td>

                <td>
                  <span class="badge badge-outline">{{ user.role }}</span>
                </td>

                <td>
                  <span
                    class="badge badge-soft"
                    :class="user.status === 'Active' ? 'badge-success' : 'badge-warning'"
                  >
                    {{ user.status }}
                  </span>
                </td>

                <td class="text-sm text-base-content/60">{{ user.lastActive }}</td>

                <td>
                  <div class="flex justify-end gap-1">
                    <button
                      class="btn btn-ghost btn-sm btn-square"
                      title="View user"
                      @click="openUserDetails(user)"
                    >
                      <Eye :size="16" />
                    </button>
                    <button
                      class="btn btn-ghost btn-sm btn-square"
                      title="Toggle account status"
                      @click="toggleUserStatus(user)"
                    >
                      <component
                        :is="user.status === 'Active' ? XCircle : CheckCircle"
                        :size="16"
                      />
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="filteredUsers.length === 0">
                <td colspan="6" class="py-10 text-center text-base-content/50">
                  No users found matching your search.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="border-t border-base-300 px-5 py-3">
          <p class="text-xs text-base-content/50">
            Showing {{ filteredUsers.length }} of {{ users.length }} users
          </p>
        </div>
      </div>
    </section>

    <!-- ROLES AND PERMISSIONS -->
    <section v-else-if="activeSection === 'roles'" class="space-y-4">
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body p-5">
            <div class="flex items-center justify-between">
              <div class="rounded-lg bg-primary/10 p-3 text-primary">
                <ShieldCheck :size="22" />
              </div>
              <span class="badge badge-primary badge-soft">Full Access</span>
            </div>
            <h3 class="mt-3 text-lg font-bold">Admin</h3>
            <p class="text-sm text-base-content/60">
              Manages the overall system, users, inventory, and laboratory transactions.
            </p>
            <div class="divider my-1"></div>
            <p class="text-xs text-base-content/50">Access includes:</p>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center gap-2"><CheckCircle :size="15" class="text-success" /> Dashboard and reports</li>
              <li class="flex items-center gap-2"><CheckCircle :size="15" class="text-success" /> Inventory management</li>
              <li class="flex items-center gap-2"><CheckCircle :size="15" class="text-success" /> Requisitions and transactions</li>
              <li class="flex items-center gap-2"><CheckCircle :size="15" class="text-success" /> User and system administration</li>
            </ul>
          </div>
        </div>

        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body p-5">
            <div class="flex items-center justify-between">
              <div class="rounded-lg bg-info/10 p-3 text-info">
                <Package :size="22" />
              </div>
              <span class="badge badge-info badge-soft">Operational Access</span>
            </div>
            <h3 class="mt-3 text-lg font-bold">Laboratory Custodian</h3>
            <p class="text-sm text-base-content/60">
              Handles laboratory equipment, availability, releases, and returns.
            </p>
            <div class="divider my-1"></div>
            <p class="text-xs text-base-content/50">Access includes:</p>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center gap-2"><CheckCircle :size="15" class="text-success" /> Inventory and equipment records</li>
              <li class="flex items-center gap-2"><CheckCircle :size="15" class="text-success" /> Requisition processing</li>
              <li class="flex items-center gap-2"><CheckCircle :size="15" class="text-success" /> Borrowing and returns</li>
              <li class="flex items-center gap-2"><CheckCircle :size="15" class="text-success" /> Availability monitoring</li>
            </ul>
          </div>
        </div>

        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body p-5">
            <div class="flex items-center justify-between">
              <div class="rounded-lg bg-success/10 p-3 text-success">
                <UserRound :size="22" />
              </div>
              <span class="badge badge-success badge-soft">Limited Access</span>
            </div>
            <h3 class="mt-3 text-lg font-bold">Student</h3>
            <p class="text-sm text-base-content/60">
              Views available equipment and manages personal requisition transactions.
            </p>
            <div class="divider my-1"></div>
            <p class="text-xs text-base-content/50">Access includes:</p>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center gap-2"><CheckCircle :size="15" class="text-success" /> Equipment availability</li>
              <li class="flex items-center gap-2"><CheckCircle :size="15" class="text-success" /> Requisition submission</li>
              <li class="flex items-center gap-2"><CheckCircle :size="15" class="text-success" /> Personal transaction records</li>
              <li class="flex items-center gap-2"><CheckCircle :size="15" class="text-success" /> Borrowing and return status</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-base-300 bg-base-100 p-5">
        <div class="flex items-start gap-3">
          <Shield :size="20" class="mt-0.5 text-base-content/60" />
          <div>
            <h3 class="font-semibold">Role Access Information</h3>
            <p class="mt-1 text-sm text-base-content/60">
              This section currently presents the planned role structure for the interface.
              Actual access restrictions and permission enforcement will be handled by the
              backend authentication and authorization system.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- SYSTEM SETTINGS -->
    <section v-else-if="activeSection === 'settings'" class="space-y-4">
      <div class="rounded-xl border border-base-300 bg-base-100">
        <div class="border-b border-base-300 p-5">
          <h3 class="font-bold">General Information</h3>
          <p class="mt-1 text-sm text-base-content/60">
            Basic information displayed throughout the system.
          </p>
        </div>

        <div class="space-y-4 p-5">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label class="form-control gap-2">
              <span class="label-text font-medium">System Name</span>
              <input
                v-model="systemSettings.systemName"
                type="text"
                class="input input-bordered w-full"
              />
            </label>

            <label class="form-control gap-2">
              <span class="label-text font-medium">Institution</span>
              <input
                v-model="systemSettings.institution"
                type="text"
                class="input input-bordered w-full"
              />
            </label>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-base-300 bg-base-100">
        <div class="border-b border-base-300 p-5">
          <h3 class="font-bold">Notification Preferences</h3>
          <p class="mt-1 text-sm text-base-content/60">
            Choose which system notifications should be enabled.
          </p>
        </div>

        <div class="divide-y divide-base-300">
          <label class="flex cursor-pointer items-center justify-between gap-4 p-5">
            <div>
              <p class="font-medium">Email Notifications</p>
              <p class="text-sm text-base-content/60">
                General system email notifications.
              </p>
            </div>
            <input
              v-model="systemSettings.emailNotifications"
              type="checkbox"
              class="toggle toggle-primary"
            />
          </label>

          <label class="flex cursor-pointer items-center justify-between gap-4 p-5">
            <div>
              <p class="font-medium">Reservation Notifications</p>
              <p class="text-sm text-base-content/60">
                Notifications related to requisition and reservation activities.
              </p>
            </div>
            <input
              v-model="systemSettings.reservationNotifications"
              type="checkbox"
              class="toggle toggle-primary"
            />
          </label>

          <label class="flex cursor-pointer items-center justify-between gap-4 p-5">
            <div>
              <p class="font-medium">Inventory Notifications</p>
              <p class="text-sm text-base-content/60">
                Notifications related to equipment and inventory updates.
              </p>
            </div>
            <input
              v-model="systemSettings.inventoryNotifications"
              type="checkbox"
              class="toggle toggle-primary"
            />
          </label>
        </div>
      </div>

      <div class="rounded-xl border border-warning/30 bg-base-100">
        <div class="border-b border-base-300 p-5">
          <h3 class="font-bold">System Maintenance</h3>
          <p class="mt-1 text-sm text-base-content/60">
            Maintenance mode is shown here as a planned configuration option.
          </p>
        </div>

        <label class="flex cursor-pointer items-center justify-between gap-4 p-5">
          <div>
            <p class="font-medium">Maintenance Mode</p>
            <p class="text-sm text-base-content/60">
              Planned option for temporarily restricting system access during maintenance.
            </p>
          </div>
          <input
            v-model="systemSettings.maintenanceMode"
            type="checkbox"
            class="toggle toggle-warning"
          />
        </label>
      </div>

      <div class="flex flex-wrap justify-end gap-2">
        <button class="btn btn-outline btn-sm" @click="resetSettings">
          <RotateCcw :size="15" />
          Reset
        </button>
        <button class="btn btn-primary btn-sm" @click="saveSettings">
          <Save :size="15" />
          Save Changes
        </button>
      </div>

      <div v-if="showSaveMessage" class="alert alert-info text-sm">
        <CheckCircle :size="18" />
        Changes are reflected in this page only. Backend saving is not connected yet.
      </div>
    </section>

    <!-- ACTIVITY LOGS -->
    <section v-else-if="activeSection === 'logs'" class="space-y-4">
      <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 class="font-bold">Recent Activities</h3>
          <p class="text-sm text-base-content/60">
            Sample records of actions performed within the system.
          </p>
        </div>

        <button class="btn btn-outline btn-sm" @click="exportActivityLogs">
          <Download :size="16" />
          Export CSV
        </button>
      </div>

      <div class="overflow-hidden rounded-xl border border-base-300 bg-base-100">
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Activity</th>
                <th>User</th>
                <th>Category</th>
                <th>Date & Time</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="log in activityLogs" :key="log.id">
                <td>
                  <p class="font-semibold">{{ log.action }}</p>
                  <p class="mt-1 text-xs text-base-content/60">
                    {{ log.description }}
                  </p>
                </td>

                <td class="text-sm">{{ log.user }}</td>

                <td>
                  <span class="badge badge-outline">{{ log.type }}</span>
                </td>

                <td class="text-sm text-base-content/60">
                  {{ log.date }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="border-t border-base-300 px-5 py-3">
          <p class="text-xs text-base-content/50">
            {{ activityLogs.length }} sample activity records
          </p>
        </div>
      </div>

      <div class="rounded-xl border border-base-300 bg-base-100 p-5">
        <div class="flex items-start gap-3">
          <Activity :size="20" class="mt-0.5 text-base-content/60" />
          <div>
            <h3 class="font-semibold">About Activity Logs</h3>
            <p class="mt-1 text-sm text-base-content/60">
              This is a visual preview using sample records. Actual activity tracking,
              timestamps, and audit records will depend on the backend implementation.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- USER DETAILS MODAL -->
    <div v-if="showUserModal && selectedUser" class="modal modal-open">
      <div class="modal-box max-w-lg">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold">User Details</h3>
          <button
            class="btn btn-ghost btn-sm btn-square"
            @click="showUserModal = false"
          >
            <X :size="18" />
          </button>
        </div>

        <div class="my-5 space-y-4">
          <div>
            <p class="text-xs text-base-content/50">Full Name</p>
            <p class="font-semibold">{{ selectedUser.name }}</p>
          </div>
          <div>
            <p class="text-xs text-base-content/50">Email Address</p>
            <p class="font-medium">{{ selectedUser.email }}</p>
          </div>
          <div>
            <p class="text-xs text-base-content/50">Account ID</p>
            <p class="font-mono text-sm">{{ selectedUser.id }}</p>
          </div>
          <div>
            <p class="text-xs text-base-content/50">Assigned Role</p>
            <span class="badge badge-outline">{{ selectedUser.role }}</span>
          </div>
          <div>
            <p class="text-xs text-base-content/50">Account Status</p>
            <span
              class="badge badge-soft"
              :class="selectedUser.status === 'Active' ? 'badge-success' : 'badge-warning'"
            >
              {{ selectedUser.status }}
            </span>
          </div>
          <div>
            <p class="text-xs text-base-content/50">Last Active</p>
            <p class="text-sm">{{ selectedUser.lastActive }}</p>
          </div>
        </div>

        <div class="modal-action">
          <button class="btn btn-primary btn-sm" @click="showUserModal = false">
            Close
          </button>
        </div>
      </div>
      <div class="modal-backdrop" @click="showUserModal = false"></div>
    </div>

    <!-- ADD USER PLACEHOLDER MODAL -->
    <div v-if="showAddUserModal" class="modal modal-open">
      <div class="modal-box max-w-md">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold">Add User</h3>
          <button
            class="btn btn-ghost btn-sm btn-square"
            @click="showAddUserModal = false"
          >
            <X :size="18" />
          </button>
        </div>

        <div class="py-5">
          <div class="rounded-lg border border-info/30 bg-info/5 p-4">
            <p class="text-sm font-semibold">User registration is not connected yet.</p>
            <p class="mt-1 text-sm text-base-content/60">
              This button is a UI placeholder. Account creation and role assignment
              will be connected after the backend workflow is finalized.
            </p>
          </div>
        </div>

        <div class="modal-action">
          <button class="btn btn-primary btn-sm" @click="showAddUserModal = false">
            Got it
          </button>
        </div>
      </div>
      <div class="modal-backdrop" @click="showAddUserModal = false"></div>
    </div>
  </div>
</template>
