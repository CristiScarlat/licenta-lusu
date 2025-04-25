class Router {
    constructor(routes, onPathChange) {
        this.routes = routes;
        this.onPathChange = onPathChange;
    }

    handlePathChange(path) {
        for (const route in this.routes) {
            if (this.routes[route].path === path) {
                this.routes[route].renderer();
                this.onPathChange(path)
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