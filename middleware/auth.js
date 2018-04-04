export default function (context) {
    if (!context.store.getters.isAuthenticated) {
        context.redirect('/admin/auth');
    }
}

// This is executed on server for first load. Client for the rest of loads.