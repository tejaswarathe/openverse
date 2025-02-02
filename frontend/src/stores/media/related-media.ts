import { useNuxtApp } from "#imports"

import { defineStore } from "pinia"

import type { SupportedMediaType } from "#shared/constants/media"
import type { FetchingError, FetchState } from "#shared/types/fetch-state"
import type { Media } from "#shared/types/media"
import { useApiClient } from "~/composables/use-api-client"

interface RelatedMediaState {
  mainMediaId: null | string
  media: Media[]
  fetchState: FetchState
}

export const useRelatedMediaStore = defineStore("related-media", {
  state: (): RelatedMediaState => ({
    mainMediaId: null,
    fetchState: { isFetching: false, hasStarted: false, fetchingError: null },
    media: [],
  }),

  getters: {
    getItemById:
      (state) =>
      (id: string): Media | undefined =>
        state.media.find((item) => item.id === id),
  },

  actions: {
    _endFetching(error?: FetchingError) {
      this.fetchState.fetchingError = error || null
      this.fetchState.hasStarted = true
      this.fetchState.isFetching = false
    },
    _startFetching() {
      this.fetchState.isFetching = true
      this.fetchState.hasStarted = true
      this.fetchState.fetchingError = null
    },
    _resetFetching() {
      this.fetchState.isFetching = false
      this.fetchState.hasStarted = false
      this.fetchState.fetchingError = null
    },

    async fetchMedia(mediaType: SupportedMediaType, id: string) {
      if (this.mainMediaId === id && this.media.length > 0) {
        return this.media
      }
      this._resetFetching()
      this.mainMediaId = id
      this._startFetching()
      this.media = []
      const client = useApiClient()

      try {
        this.media = await client.getRelatedMedia(mediaType, id)
        this._endFetching()

        return this.media
      } catch (error) {
        const { $processFetchingError } = useNuxtApp()
        const errorData = $processFetchingError(error, mediaType, "related", {
          id,
        })
        this._endFetching(errorData)
        return null
      }
    },
  },
})
