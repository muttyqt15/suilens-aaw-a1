<template>
  <div>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" to="/" class="mb-4">Back to Catalog</v-btn>

    <h1 class="text-h4 mb-6">Place Rental Order</h1>

    <v-alert v-if="success" type="success" class="mb-4">
      Order placed successfully! Order ID: {{ success.id }}
    </v-alert>

    <v-alert v-if="mutation.error.value" type="error" class="mb-4">
      {{ mutation.error.value.message }}
    </v-alert>

    <v-card max-width="600">
      <v-card-text>
        <v-form @submit.prevent="submitOrder">
          <v-text-field
            v-model="form.customerName"
            label="Full Name"
            :rules="[v => !!v || 'Name is required']"
            required
          />
          <v-text-field
            v-model="form.customerEmail"
            label="Email"
            type="email"
            :rules="[v => !!v || 'Email is required']"
            required
          />
          <v-select
            v-model="form.branchCode"
            label="Branch"
            :items="branchOptions"
            item-title="title"
            item-value="value"
            :rules="[v => !!v || 'Branch is required']"
            :loading="stockLoading"
            required
          />
          <v-text-field
            v-model="form.startDate"
            label="Start Date"
            type="date"
            :rules="[v => !!v || 'Start date is required']"
            required
          />
          <v-text-field
            v-model="form.endDate"
            label="End Date"
            type="date"
            :rules="[v => !!v || 'End date is required']"
            required
          />
          <v-btn
            type="submit"
            color="primary"
            :loading="mutation.isPending.value"
            :disabled="!form.branchCode"
            block
            class="mt-4"
          >
            Place Order
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useCreateOrder } from '../composables/useOrders';
import { useLensStock } from '../composables/useInventory';

const route = useRoute();
const lensId = route.params.lensId as string;

const { data: stockData, isLoading: stockLoading } = useLensStock(lensId);

const branchOptions = computed(() => {
  if (!stockData.value) return [];
  return stockData.value.branches
    .filter((b) => b.availableQuantity > 0)
    .map((b) => ({
      title: `${b.branchName} (${b.availableQuantity} available)`,
      value: b.branchCode,
    }));
});

const form = reactive({
  customerName: '',
  customerEmail: '',
  branchCode: '',
  startDate: '',
  endDate: '',
});

const success = ref<{ id: string } | null>(null);
const mutation = useCreateOrder();

function submitOrder() {
  success.value = null;
  mutation.mutate(
    {
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      lensId,
      branchCode: form.branchCode,
      startDate: form.startDate,
      endDate: form.endDate,
    },
    {
      onSuccess: (data) => {
        success.value = data;
      },
    },
  );
}
</script>
