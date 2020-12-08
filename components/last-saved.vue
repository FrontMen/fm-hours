<template>
    <div>
        <template v-if="lastSavedDate">
            Last saved {{lastSavedLabel}}
        </template>
    </div>
</template>

<script>
import { formatDistanceToNow } from "date-fns";
import { mapGetters } from "vuex";
export default {
    computed: {
        ...mapGetters({
            lastSavedDate: 'user/getLastSavedDate',
        }),
    },
    data() {
        return {
            interval: undefined,
            lastSavedLabel: undefined
        }
    },
    destroyed() {
        clearInterval(this.interval);
    },
    watch: {
        lastSavedDate: {
            immediate: true,
            handler (val, oldVal) {
                if (val) {
                    this.lastSavedLabel = this.updateLastSavedLabel(this.lastSavedDate);
                    this.setInterval();
                }
            }
        }
    },
    methods: {
        setInterval() {
            if (this.interval) {
                clearInterval(this.interval);
            }
            this.interval = setInterval(() => {
                this.lastSavedLabel = this.updateLastSavedLabel(this.lastSavedDate);
            }, 10000);
        },
        updateLastSavedLabel(date) {
            return formatDistanceToNow(date, {addSuffix: true});
        },
    }
};
</script>