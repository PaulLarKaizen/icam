
<script setup lang="ts">
import { ref } from 'vue'
import {
  UserRound,
  Mail,
  GraduationCap,
  IdCard,
  ShieldCheck,
  Pencil,
  Save,
  X,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'student',
  title: 'My Profile',
})

useSeoMeta({
  title: 'My Profile | ICAM',
  description: 'View and manage your student profile.',
})

interface StudentProfile {
  fullName: string
  studentId: string
  email: string
  course: string
  yearLevel: string
  section: string
}

const profile = ref<StudentProfile>({
  fullName: 'Juan Dela Cruz',
  studentId: '2024-00001',
  email: 'juan.delacruz@sdca.edu.ph',
  course: 'Bachelor of Science in Medical Laboratory Science',
  yearLevel: '3rd Year',
  section: 'MLS 3A',
})

const originalProfile = ref({ ...profile.value })
const isEditing = ref(false)
const showSuccess = ref(false)

function startEditing() {
  originalProfile.value = { ...profile.value }
  showSuccess.value = false
  isEditing.value = true
}

function saveProfile() {
  originalProfile.value = { ...profile.value }
  isEditing.value = false
  showSuccess.value = true
}

function cancelEditing() {
  profile.value = { ...originalProfile.value }
  isEditing.value = false
  showSuccess.value = false
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold">My Profile</h1>
        <p class="mt-1 text-base-content/60">
          View and manage your student account information.
        </p>
      </div>

      <button
        v-if="!isEditing"
        class="btn btn-primary"
        @click="startEditing"
      >
        <Pencil :size="18" />
        Edit Profile
      </button>
    </div>

    <!-- Success Message -->
    <div
      v-if="showSuccess"
      class="alert alert-success"
    >
      <ShieldCheck :size="20" />
      <span>Profile information updated successfully.</span>
    </div>

    <!-- Profile Header Card -->
    <div class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div class="avatar placeholder">
            <div class="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-content">
              <UserRound :size="36" />
            </div>
          </div>

          <div class="flex-1">
            <h2 class="text-xl font-bold">
              {{ profile.fullName }}
            </h2>
            <p class="text-sm text-base-content/60">
              {{ profile.studentId }}
            </p>
            <div class="mt-2 flex flex-wrap gap-2">
              <span class="badge badge-primary badge-outline">
                Student
              </span>
              <span class="badge badge-success badge-outline">
                Active Account
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Personal Information -->
    <div class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body space-y-4">
        <div class="flex items-center gap-2">
          <UserRound :size="20" class="text-primary" />
          <h2 class="card-title text-lg">Personal Information</h2>
        </div>

        <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
          <!-- Full Name -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Full Name</span>
            </label>
            <input
              v-model="profile.fullName"
              type="text"
              class="input input-bordered w-full"
              :disabled="!isEditing"
            />
          </div>

          <!-- Student ID -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Student ID</span>
            </label>
            <div class="relative">
              <IdCard
                :size="18"
                class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
              />
              <input
                v-model="profile.studentId"
                type="text"
                class="input input-bordered w-full pl-10"
                disabled
              />
            </div>
          </div>

          <!-- Email -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Email Address</span>
            </label>
            <div class="relative">
              <Mail
                :size="18"
                class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
              />
              <input
                v-model="profile.email"
                type="email"
                class="input input-bordered w-full pl-10"
                :disabled="!isEditing"
              />
            </div>
          </div>

          <!-- Course -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Course / Program</span>
            </label>
            <div class="relative">
              <GraduationCap
                :size="18"
                class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
              />
              <input
                v-model="profile.course"
                type="text"
                class="input input-bordered w-full pl-10"
                disabled
              />
            </div>
          </div>

          <!-- Year Level -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Year Level</span>
            </label>
            <select
              v-model="profile.yearLevel"
              class="select select-bordered w-full"
              :disabled="!isEditing"
            >
              <option>1st Year</option>
              <option>2nd Year</option>
              <option>3rd Year</option>
              <option>4th Year</option>
              <option>5th Year</option>
            </select>
          </div>

          <!-- Section -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Section</span>
            </label>
            <input
              v-model="profile.section"
              type="text"
              class="input input-bordered w-full"
              :disabled="!isEditing"
            />
          </div>
        </div>

        <!-- Edit Actions -->
        <div
          v-if="isEditing"
          class="flex flex-wrap justify-end gap-2 border-t border-base-300 pt-4"
        >
          <button
            class="btn btn-ghost"
            @click="cancelEditing"
          >
            <X :size="18" />
            Cancel
          </button>

          <button
            class="btn btn-primary"
            @click="saveProfile"
          >
            <Save :size="18" />
            Save Changes
          </button>
        </div>
      </div>
    </div>

    <!-- Account Information -->
    <div class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body space-y-4">
        <div class="flex items-center gap-2">
          <ShieldCheck :size="20" class="text-primary" />
          <h2 class="card-title text-lg">Account Information</h2>
        </div>

        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <p class="text-sm text-base-content/60">Account Role</p>
            <p class="mt-1 font-medium">Student</p>
          </div>

          <div>
            <p class="text-sm text-base-content/60">Account Status</p>
            <div class="mt-1">
              <span class="badge badge-success badge-outline">
                Active
              </span>
            </div>
          </div>

          <div>
            <p class="text-sm text-base-content/60">Access</p>
            <p class="mt-1 font-medium">Student Portal</p>
          </div>

          <div>
            <p class="text-sm text-base-content/60">System</p>
            <p class="mt-1 font-medium">
              ICAM - Laboratory Equipment Management
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Notice -->
    <div class="alert border border-base-300 bg-base-200">
      <ShieldCheck :size="20" class="shrink-0" />
      <div>
        <p class="font-medium">Account Information</p>
        <p class="text-sm opacity-70">
          Your student ID and course information are managed by the system.
          Contact the laboratory custodian or administrator if you need
          assistance updating account details.
        </p>
      </div>
    </div>
  </div>
</template>
