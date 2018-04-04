<template>
  <div class="admin-new-post-page">
      <section class="section new-post-form">
          <AdminPostForm @submit="onSubmitted"/>
      </section>
  </div>
</template>

<script>
import axios from 'axios';
import AdminPostForm from "@/components/admin/AdminPostForm";
export default {
    middleware: ['check-auth', 'auth'],
    layout: 'admin',
    components: {
        AdminPostForm
    },
    methods: {
        onSubmitted(postData) {
            this.$store.dispatch('addPost', postData)
            .then((res) => {
                this.$router.push("/admin");
            }).catch(err => console.log(err));
        }
    }
};

</script>


<style scoped>
.new-post-form {
    width: 90%;
    margin: 20px auto;
}

@media (min-width: 768px) {
    .new-post-form {
        width: 500px;
    }
}
</style>
