import { defineNuxtMiddleware } from "@nuxtjs/composition-api";

export default defineNuxtMiddleware(({ store, redirect }) => {
  if (!store.getters["user/isUserAdmin"]) {
    return redirect("/records");
  }
});
