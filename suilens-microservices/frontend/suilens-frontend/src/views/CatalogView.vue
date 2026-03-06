<template>
  <div>
    <h1 class="text-h4 mb-6">Lens Catalog</h1>

    <v-progress-circular v-if="isLoading" indeterminate class="d-block mx-auto" />

    <v-alert v-else-if="error" type="error" class="mb-4">
      Failed to load lenses: {{ error.message }}
    </v-alert>

    <v-row v-else>
      <v-col v-for="lens in data" :key="lens.id" cols="12" sm="6" md="4">
        <v-card class="h-100 d-flex flex-column">
          <v-card-title>{{ lens.modelName }}</v-card-title>
          <v-card-subtitle>{{ lens.manufacturerName }} &bull; {{ lens.mountType }}</v-card-subtitle>
          <v-card-text class="flex-grow-1">
            <p class="mb-2">{{ lens.description }}</p>
            <v-chip size="small" class="mr-1">
              {{ lens.minFocalLength === lens.maxFocalLength
                ? `${lens.minFocalLength}mm`
                : `${lens.minFocalLength}-${lens.maxFocalLength}mm` }}
            </v-chip>
            <v-chip size="small">f/{{ lens.maxAperture }}</v-chip>
            <div class="mt-3">
              <strong>Rp {{ Number(lens.dayPrice).toLocaleString() }}</strong> / day
            </div>
            <LensStockChips :lens-id="lens.id" />
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" variant="elevated" :to="`/order/${lens.id}`">
              Rent
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { useLenses } from '../composables/useLenses';
import LensStockChips from '../components/LensStockChips.vue';

const { data, isLoading, error } = useLenses();
</script>
