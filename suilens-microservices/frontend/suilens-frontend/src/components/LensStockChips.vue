<template>
  <div v-if="isLoading" class="mt-2">
    <v-progress-circular size="16" width="2" indeterminate />
  </div>
  <div v-else-if="data" class="mt-2">
    <v-chip
      v-for="branch in data.branches"
      :key="branch.branchCode"
      size="small"
      :color="branch.availableQuantity > 0 ? 'success' : 'grey'"
      class="mr-1 mb-1"
    >
      {{ branch.availableQuantity }} unit di {{ branch.branchName }}
    </v-chip>
  </div>
</template>

<script setup lang="ts">
import { useLensStock } from '../composables/useInventory';

const props = defineProps<{ lensId: string }>();
const { data, isLoading } = useLensStock(props.lensId);
</script>
