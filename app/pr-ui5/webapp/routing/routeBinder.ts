import Log from "sap/base/Log";
import Controller from "sap/ui/core/mvc/Controller";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import Router from "sap/ui/core/routing/Router";
import UIComponent from "sap/ui/core/UIComponent";

export type PatternHandler = (e: Route$PatternMatchedEvent) => void;

/**
 * Attaches event handler <code>fnFunction</code> to the {@link sap.ui.core.routing.Route#event:patternMatched patternMatched} event of each route in the given <code>routeNames</code> array.
 * The event handler will be called with the <code>controller</code> as the listener context, so that `this` can be used in the handler.
 * The returned object contains the used router and a detach function to detach the event handlers.
 * @param {sap.ui.core.mvc.Controller} controller The controller that will be used as the listener context.
 * @param {string[]} routeNames The names of the routes to attach the event handler to.
 * @param {PatternHandler} handler The event handler to be called when the <code>patternMatched</code> event is fired.
 * @returns {{ router: sap.ui.core.routing.Router; detach: () => void }}
 */
export function attachPatternMatchedRoutes(
  controller: Controller,
  routeNames: string[],
  handler: PatternHandler
): { router: Router; detach: () => void } {
  const comp = controller.getOwnerComponent() as UIComponent | undefined;

  const router = comp.getRouter();

  // attach with 'controller' as listener context so `this` works in the handler
  const attachRouters = routeNames
    .map((name) => {
      const r = router.getRoute(name);
      if (!r) {
        Log.warning(`[routeBinder] Route "${name}" not found`);
        return null;
      }

      r.attachPatternMatched(handler, controller);
      return r;
    })
    .filter((r): r is NonNullable<typeof r> => !!r);

  const detach = () => {
    attachRouters.forEach((r) => r.detachPatternMatched(handler, controller));
  };

  return { router, detach };
}

/**
 * Attaches event handlers to the {@link sap.ui.core.routing.Route#event:patternMatched patternMatched} event of each route in the given <code>map</code>.
 * The event handler will be called with the <code>controller</code> as the listener context, so that `this` can be used in the handler.
 * The returned object contains the used router and a detach function to detach the event handlers.
 * @param {sap.ui.core.mvc.Controller} controller The controller that will be used as the listener context.
 * @param {Record<string, PatternHandler>} map A map of route names to event handlers.
 * @returns {{ router: sap.ui.core.routing.Router; detach: () => void }}
 */
export function attachPatternMatchedMap(
  controller: Controller,
  map: Record<string, PatternHandler>
): { router: Router; detach: () => void } {
  const comp = controller.getOwnerComponent() as UIComponent | undefined;
  if (!comp) throw new Error("No owner component");

  const router = comp.getRouter();
  const entries = Object.entries(map)
    .map(([name, h]) => {
      const r = router.getRoute(name);
      if (!r) {
        console.warn(`[routeBinder] Route "${name}" not found.`);
        return null;
      }
      r.attachPatternMatched(h, controller);
      return { r, h };
    })
    .filter(Boolean) as Array<{
    r: ReturnType<Router["getRoute"]>;
    h: PatternHandler;
  }>;

  const detach = () => {
    entries.forEach(({ r, h }) => r.detachPatternMatched(h, controller));
  };

  return { router, detach };
}
