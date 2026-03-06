import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCartStore = defineStore('cart', () => {
  const selectedLensId = ref<string | null>(null);
  const customerName = ref('');
  const customerEmail = ref('');

  function selectLens(lensId: string) {
    selectedLensId.value = lensId;
  }

  function reset() {
    selectedLensId.value = null;
    customerName.value = '';
    customerEmail.value = '';
  }

  return { selectedLensId, customerName, customerEmail, selectLens, reset };
});
