
<template>
   <div class="modal-wrapper shadow" @click.self="shadowClick()">
      <div
         class="modal-content-x container-fluid p-4 shadow bg-white border rounded position-absolute col-sm-10 col-lg-8 col-xl-6 col-xxl-5"
      >
         <slot></slot>
      </div>
   </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted } from 'vue';

export default defineComponent({
   emits: {
      'close': () => true
   },
   setup(_, { emit }) {

      const shadowClick = (): void => {
         emit('close');
      };

      const keyPress = (evt: KeyboardEvent) => {
         if (evt.key !== 'Escape') { return; }
         emit('close');
      };

      window.addEventListener('keyup', keyPress);

      onUnmounted(() => {
         window.removeEventListener('keyup', keyPress);
      });

      //If we want to have .fade on the wrapper div, we need to have it hidden by default then .show it after it's rendered. This will work but it causes a vue internals error when testing with puppeteer. Disabling for now
      // const show = ref(false);
      // nextTick(() => show.value = true);
      //If enabling, add this to the div
      //:class="{'show': show }"

      return { shadowClick };
   }
});

</script>

<style lang="postcss" scoped>
.modal-wrapper {
   position: fixed;
   top: 0;
   left: 0;
   bottom: 0;
   width: 100%;
   background-color: rgba(0, 0, 0, 0.3);
   z-index: 2000;
   backdrop-filter: blur(5px);
   max-width: 100vw; /*Whithout this, when we scale to xs and 100% is set, it extends off the screen because there's horizont scrolling from the columns */
}

.modal-content-x {
   overflow: auto;
   max-height: 90vh;
   top: 50%;
   left: 50%;
   transform: translate(-50%, -50%);
}
</style>
