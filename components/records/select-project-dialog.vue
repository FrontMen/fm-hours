<template>
  <b-modal
    id="modal-add-project"
    ref="modal"
    title="Add project"
    cancel-variant="outline-primary"
    centered
    @show="reset"
    @ok="handleOk"
    @hidden="reset"
  >
    <form ref="form" @submit.stop.prevent="handleSubmit">
      <b-form-group
        label="Name"
        label-for="project-input"
        invalid-feedback="Please choose a project from the list"
        :state="selectState"
      >
        <b-form-select
          id="project-input"
          v-model="selectedProject"
          :options="projects"
          :state="selectState"
          required
        />
      </b-form-group>
    </form>
  </b-modal>
</template>

<script lang="ts">
import {
  defineComponent,
  nextTick,
  PropType,
  ref,
} from "@nuxtjs/composition-api";
import hotkeys from 'hotkeys-js';

export default defineComponent({
  emits: ["project-selected"],
  props: {
    projects: {
      type: Array as PropType<Customer[]>,
      default: () => [],
    },
  },
  beforeDestroy() {
    hotkeys.unbind("n");
  },
  setup(_, {emit, refs}) {
    const selectState = ref(null);
    const selectedProject = ref(null);

    const reset = () => {
      selectState.value = null;
      selectedProject.value = null;
    };

    const checkFormValidity = () => {
      // @ts-ignore (BFormGroup does not have proper typing)
      return refs.form.checkValidity();
    };

    const handleSubmit = () => {
      if (checkFormValidity()) {
        emit("project-selected", selectedProject.value);

        nextTick(() => {
          // @ts-ignore (BModal does not have proper typing)
          refs.modal.hide("modal-add-project");
        });
      }
    };

    const handleOk = (event: Event) => {
      event.preventDefault();
      handleSubmit();
    };

    hotkeys('n', () => {
      // @ts-ignore (BFormGroup does not have proper typing)
      refs.modal.show("modal-add-project");
    });

    return {
      selectState,
      selectedProject,
      reset,
      checkFormValidity,
      handleSubmit,
      handleOk,
    };
  },
});
</script>
