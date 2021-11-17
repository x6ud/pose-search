import {vec3} from 'gl-matrix';
import {raycastPlane, raycastSphere} from '../math/raycast';
import Camera3D from '../render/camera/Camera3D';

export class MouseDragContext3D {
    dragStartMousePosition = vec3.create();
    dragStartOriginPosition = vec3.create();
    dragStartTargetPosition = vec3.create();
    mousePosition = vec3.create();
    mouseRay0 = vec3.create();
    mouseRay1 = vec3.create();
    rayResult0 = vec3.create();
    rayResult1 = vec3.create();
    normal = vec3.create();
    radius = 0;
    offset = vec3.create();
}

export function raycastViewPlaneDragStart(
    context: MouseDragContext3D,
    projectedMouseX: number, projectedMouseY: number,
    targetX: number, targetY: number, targetZ: number,
    camera: Camera3D
) {
    vec3.set(context.dragStartMousePosition, projectedMouseX, projectedMouseY, 0);
    vec3.set(context.dragStartTargetPosition, targetX, targetY, targetZ);
    vec3.sub(context.normal, camera.target, camera.position);
}

export function raycastViewPlaneDragMove(
    context: MouseDragContext3D,
    projectedMouseX: number, projectedMouseY: number,
    camera: Camera3D
): boolean {
    context.dragStartMousePosition[2] = -1;
    camera.screenToView(context.mouseRay0, context.dragStartMousePosition);
    context.dragStartMousePosition[2] = 1;
    camera.screenToView(context.mouseRay1, context.dragStartMousePosition);
    if (!raycastPlane(
        context.rayResult0,
        context.mouseRay0[0], context.mouseRay0[1], context.mouseRay0[2],
        context.mouseRay1[0], context.mouseRay1[1], context.mouseRay1[2],
        context.dragStartTargetPosition[0], context.dragStartTargetPosition[1], context.dragStartTargetPosition[2],
        context.normal[0], context.normal[1], context.normal[2],
    )) {
        return false;
    }
    vec3.set(context.mousePosition, projectedMouseX, projectedMouseY, -1);
    camera.screenToView(context.mouseRay0, context.mousePosition);
    vec3.set(context.mousePosition, projectedMouseX, projectedMouseY, +1);
    camera.screenToView(context.mouseRay1, context.mousePosition);
    if (!raycastPlane(
        context.rayResult1,
        context.mouseRay0[0], context.mouseRay0[1], context.mouseRay0[2],
        context.mouseRay1[0], context.mouseRay1[1], context.mouseRay1[2],
        context.dragStartTargetPosition[0], context.dragStartTargetPosition[1], context.dragStartTargetPosition[2],
        context.normal[0], context.normal[1], context.normal[2],
    )) {
        return false;
    }
    vec3.sub(context.offset, context.rayResult1, context.rayResult0);
    return true;
}

export function raycastSphereDragStart(
    context: MouseDragContext3D,
    projectedMouseX: number, projectedMouseY: number,
    originX: number, originY: number, originZ: number,
    targetX: number, targetY: number, targetZ: number,
    camera: Camera3D
) {
    vec3.set(context.dragStartMousePosition, projectedMouseX, projectedMouseY, 0);
    vec3.set(context.dragStartOriginPosition, originX, originY, originZ);
    vec3.set(context.dragStartTargetPosition, targetX, targetY, targetZ);
    vec3.sub(context.normal, context.dragStartTargetPosition, camera.position);
    context.radius = vec3.distance(context.dragStartOriginPosition, context.dragStartTargetPosition);
}

export function raycastSphereDragMove(
    context: MouseDragContext3D,
    projectedMouseX: number, projectedMouseY: number,
    camera: Camera3D
): boolean {
    const zOrigin = vec3.dot(context.normal, context.dragStartOriginPosition);
    const zTarget = vec3.dot(context.normal, context.dragStartTargetPosition);
    if (zTarget - zOrigin <= 0) {
        vec3.set(context.mousePosition, projectedMouseX, projectedMouseY, -1);
        camera.screenToView(context.mouseRay0, context.mousePosition);
        vec3.set(context.mousePosition, projectedMouseX, projectedMouseY, +1);
        camera.screenToView(context.mouseRay1, context.mousePosition);
        if (raycastSphere(
            context.rayResult1,
            context.mouseRay0[0], context.mouseRay0[1], context.mouseRay0[2],
            context.mouseRay1[0], context.mouseRay1[1], context.mouseRay1[2],
            context.dragStartOriginPosition[0], context.dragStartOriginPosition[1], context.dragStartOriginPosition[2],
            context.radius,
        )) {
            return true;
        }
        return raycastPlane(
            context.rayResult1,
            context.mouseRay0[0], context.mouseRay0[1], context.mouseRay0[2],
            context.mouseRay1[0], context.mouseRay1[1], context.mouseRay1[2],
            context.dragStartOriginPosition[0], context.dragStartOriginPosition[1], context.dragStartOriginPosition[2],
            context.normal[0], context.normal[1], context.normal[2],
        );
    }
    return raycastViewPlaneDragMove(context, projectedMouseX, projectedMouseY, camera);
}