export default function (context) {
    context.store.dispatch('initAuth', context.req);
}

// This is executed on server for first load. Client for the rest of loads.