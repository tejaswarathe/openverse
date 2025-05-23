import { h } from "vue"

import VHomeLink from "~/components/VHeader/VHomeLink.vue"

import type { Meta, StoryObj } from "@storybook/vue3"

const meta = {
  title: "Components/VHeader/HomeLinks/VHomeLink",
  component: VHomeLink,
} satisfies Meta<typeof VHomeLink>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { VHomeLink },
    setup() {
      return () => h("div", { class: `flex p-4` }, h(VHomeLink, { ...args }))
    },
  }),
  name: "Default",
}
