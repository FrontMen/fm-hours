<template>
  <b-modal
    id="modal-add-project"
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

<script>
export default {
  props: {
    projects: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      selectState: null,
      selectedProject: null,
    };
  },
  methods: {
    reset() {
      this.selectState = null;
      this.selectedProject = null;
    },
    checkFormValidity() {
      this.selectState = this.$refs.form.checkValidity();
      return this.selectState;
    },
    handleOk(event) {
      event.preventDefault();
      this.handleSubmit();
    },
    handleSubmit() {
      if (!this.checkFormValidity()) {
        return;
      }
      this.$emit("project-selected", this.selectedProject);
      this.$nextTick(() => {
        this.$bvModal.hide("modal-add-project");
      });
    },
  },
};
</script>
