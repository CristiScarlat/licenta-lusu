class Router {
    constructor(routes) {
        this.routes = routes;
        // this.handlePathChange(window.location.pathname);
    }

    handlePathChange(path) {
        for (const route in this.routes) {
            if (this.routes[route].path === path) {
                this.routes[route].renderer();
                return;
            }
        }
        console.log('No matching route found for path:', path);
    }

    navigate(path) {
        window.history.pushState({time: Date.now()}, '', path);
        this.handlePathChange(path);
    }
}


export default Router;