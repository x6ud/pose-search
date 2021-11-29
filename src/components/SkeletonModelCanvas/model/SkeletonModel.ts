import {mat4, ReadonlyVec3, vec3} from 'gl-matrix';
import {quatLookRotation} from '../../../utils/math/math';
import Camera3D from '../../../utils/render/camera/Camera3D';
import Renderer from '../../../utils/render/Renderer';
import ObjLoader from '../ObjLoader';
import {BodyPart} from './BodyPart';
import SkeletonModelNode from './SkeletonModelNode';

const ZERO: ReadonlyVec3 = [0, 0, 0];

export default class SkeletonModel {

    root = new SkeletonModelNode();

    [BodyPart.trunk] = this.root;
    [BodyPart.head] = new SkeletonModelNode();
    [BodyPart.leftUpperArm] = new SkeletonModelNode();
    [BodyPart.leftLowerArm] = new SkeletonModelNode();
    [BodyPart.leftHand] = new SkeletonModelNode();
    [BodyPart.leftThigh] = new SkeletonModelNode();
    [BodyPart.leftCalf] = new SkeletonModelNode();
    [BodyPart.leftFoot] = new SkeletonModelNode();
    [BodyPart.rightUpperArm] = new SkeletonModelNode();
    [BodyPart.rightLowerArm] = new SkeletonModelNode();
    [BodyPart.rightHand] = new SkeletonModelNode();
    [BodyPart.rightThigh] = new SkeletonModelNode();
    [BodyPart.rightCalf] = new SkeletonModelNode();
    [BodyPart.rightFoot] = new SkeletonModelNode();

    update(camera: Camera3D, node: SkeletonModelNode = this.root) {
        const stack: SkeletonModelNode[] = [node];
        for (; ;) {
            const node = stack.pop();
            if (!node) {
                break;
            }
            stack.push(...node.children);

            quatLookRotation(node.localRotation, node.forward, node.up);
            mat4.fromRotationTranslation(node.localMatrix, node.localRotation, node.translation);
            if (node.parent) {
                mat4.mul(node.worldMatrix, node.parent.worldMatrix, node.localMatrix);
            } else {
                mat4.copy(node.worldMatrix, node.localMatrix);
            }

            vec3.transformMat4(node.originWorldPosition, ZERO, node.worldMatrix);
            vec3.transformMat4(node.originViewPosition, node.originWorldPosition, camera.viewMatrix);
            if (node.controlPoint) {
                vec3.transformMat4(node.controlPointWorldPosition, node.controlPoint, node.worldMatrix);
                vec3.transformMat4(node.controlPointViewPosition, node.controlPointWorldPosition, camera.viewMatrix);
                vec3.transformMat4(node.controlPointScreenPosition, node.controlPointWorldPosition, camera.pvMatrix);
            }

            if (node.landmarks.length !== node.landmarksWorldPositions.length) {
                node.landmarksWorldPositions = node.landmarks.map(_ => [0, 0, 0]);
                node.landmarksViewPosition = node.landmarks.map(_ => [0, 0, 0]);
            }
            for (let i = 0, len = node.landmarks.length; i < len; ++i) {
                vec3.transformMat4(node.landmarksWorldPositions[i], node.landmarks[i], node.worldMatrix);
                vec3.transformMat4(node.landmarksViewPosition[i], node.landmarksWorldPositions[i], camera.viewMatrix);
            }
        }
    }

    render(renderer: Renderer) {
        const stack: SkeletonModelNode[] = [this.root];
        for (; ;) {
            const node = stack.pop();
            if (!node) {
                break;
            }
            stack.push(...node.children);
            node.render(renderer);
        }
    }

    async init() {
        // =============== load objs ===============
        const headObjPromise = import('./obj/head.obj');
        const trunkObjPromise = import('./obj/trunk.obj');
        const leftUpperArmObjPromise = import('./obj/left-upper-arm.obj');
        const leftLowerArmObjPromise = import('./obj/left-lower-arm.obj');
        const leftHandObjPromise = import('./obj/left-hand.obj');
        const rightUpperArmObjPromise = import('./obj/right-upper-arm.obj');
        const rightLowerArmObjPromise = import('./obj/right-lower-arm.obj');
        const rightHandObjPromise = import('./obj/right-hand.obj');
        const leftThighObjPromise = import('./obj/left-thigh.obj');
        const leftCalfObjPromise = import('./obj/left-calf.obj');
        const leftFootObjPromise = import('./obj/left-foot.obj');
        const rightThighObjPromise = import('./obj/right-thigh.obj');
        const rightCalfObjPromise = import('./obj/right-calf.obj');
        const rightFootObjPromise = import('./obj/right-foot.obj');

        await Promise.all([
            headObjPromise,
            trunkObjPromise,
            leftUpperArmObjPromise,
            leftLowerArmObjPromise,
            leftHandObjPromise,
            rightUpperArmObjPromise,
            rightLowerArmObjPromise,
            rightHandObjPromise,
            leftThighObjPromise,
            leftCalfObjPromise,
            leftFootObjPromise,
            rightThighObjPromise,
            rightCalfObjPromise,
            rightFootObjPromise,
        ]);

        const headVertices = new ObjLoader().load((await headObjPromise).default);
        const trunkVertices = new ObjLoader().load((await trunkObjPromise).default);
        const leftUpperArmVertices = new ObjLoader().load((await leftUpperArmObjPromise).default);
        const leftLowerArmVertices = new ObjLoader().load((await leftLowerArmObjPromise).default);
        const leftHandVertices = new ObjLoader().load((await leftHandObjPromise).default);
        const rightUpperArmVertices = new ObjLoader().load((await rightUpperArmObjPromise).default);
        const rightLowerArmVertices = new ObjLoader().load((await rightLowerArmObjPromise).default);
        const rightHandVertices = new ObjLoader().load((await rightHandObjPromise).default);
        const leftThighVertices = new ObjLoader().load((await leftThighObjPromise).default);
        const leftCalfVertices = new ObjLoader().load((await leftCalfObjPromise).default);
        const leftFootVertices = new ObjLoader().load((await leftFootObjPromise).default);
        const rightThighVertices = new ObjLoader().load((await rightThighObjPromise).default);
        const rightCalfVertices = new ObjLoader().load((await rightCalfObjPromise).default);
        const rightFootVertices = new ObjLoader().load((await rightFootObjPromise).default);

        // =============== move rotation origins to joint connection points ===============
        const headOffset: [number, number, number] = [
            0,
            headVertices.lowerY + headVertices.yRange * 0.35,
            headVertices.zRange * -0.1,
        ];
        const leftUpperArmOffset: [number, number, number] = [
            leftUpperArmVertices.lowerX + leftUpperArmVertices.xRange * 0.3,
            leftUpperArmVertices.lowerY + leftUpperArmVertices.yRange * (1 - 0.075),
            leftUpperArmVertices.zRange * -0.1,
        ];
        const leftLowerArmOffset: [number, number, number] = [
            leftLowerArmVertices.lowerX - leftUpperArmOffset[0] + leftLowerArmVertices.xRange * 0.5,
            leftLowerArmVertices.lowerY - leftUpperArmOffset[1] + leftLowerArmVertices.yRange * (1 - 0.05),
            leftLowerArmVertices.lowerZ - leftUpperArmOffset[2] + leftLowerArmVertices.zRange * 0.3,
        ];
        const leftHandOffset: [number, number, number] = [
            leftHandVertices.lowerX - leftLowerArmOffset[0] - leftUpperArmOffset[0] + leftHandVertices.xRange * 0.85,
            leftHandVertices.lowerY - leftLowerArmOffset[1] - leftUpperArmOffset[1] + leftHandVertices.yRange * (1 - 0.05),
            leftHandVertices.lowerZ - leftLowerArmOffset[2] - leftUpperArmOffset[2] + leftHandVertices.zRange * 0.65,
        ];
        const leftThighOffset: [number, number, number] = [
            leftThighVertices.lowerX + leftThighVertices.xRange * 0.5,
            leftThighVertices.lowerY + leftThighVertices.yRange * (1 - 0.05),
            leftThighVertices.zRange * 0.05,
        ];
        const leftCalfOffset: [number, number, number] = [
            leftCalfVertices.lowerX - leftThighOffset[0] + leftCalfVertices.xRange * 0.5,
            leftCalfVertices.lowerY - leftThighOffset[1] + leftCalfVertices.yRange * (1 - 0.05),
            leftCalfVertices.lowerZ - leftThighOffset[2] + leftCalfVertices.zRange * 0.65,
        ];
        const leftFootOffset: [number, number, number] = [
            leftFootVertices.lowerX - leftThighOffset[0] - leftCalfOffset[0] + leftFootVertices.xRange * 0.3,
            leftFootVertices.lowerY - leftThighOffset[1] - leftCalfOffset[1] + leftFootVertices.yRange * (1 - 0.25),
            leftFootVertices.lowerZ - leftThighOffset[2] - leftCalfOffset[2] + leftFootVertices.zRange * 0.25,
        ];

        // =============== control points positions ===============
        const trunkControlPoint: [number, number, number] = [0, trunkVertices.yRange * 0.75, 0];
        const headControlPoint: [number, number, number] = [0, 0, headVertices.yRange * 0.5];
        const leftUpperArmControlPoint: [number, number, number] = [
            leftUpperArmVertices.xRange * 0.3,
            leftUpperArmVertices.yRange * -0.85,
            leftUpperArmVertices.zRange * -0.3,
        ];
        const leftLowerArmControlPoint: [number, number, number] = [
            0,
            leftLowerArmVertices.yRange * -0.9,
            leftLowerArmVertices.zRange * 0.4,
        ];
        const leftHandControlPoint: [number, number, number] = [
            leftHandVertices.xRange * -0.2,
            leftHandVertices.yRange * -0.8,
            leftHandVertices.zRange * -0.1,
        ];
        const leftThighControlPoint: [number, number, number] = [
            leftThighVertices.xRange * -0.15,
            leftThighVertices.yRange * -0.87,
            leftThighVertices.zRange * -0.25,
        ];
        const leftCalfControlPoint: [number, number, number] = [
            0,
            leftCalfVertices.yRange * -0.85,
            leftCalfVertices.zRange * -0.3,
        ];
        const leftFootControlPoint: [number, number, number] = [
            leftFootVertices.xRange * 0.25,
            leftFootVertices.yRange * -0.5,
            leftFootVertices.zRange * 0.6,
        ];

        // =============== create nodes ===============
        function mirror(vec: [number, number, number]): [number, number, number] {
            return [-vec[0], vec[1], vec[2]];
        }

        const trunk = this.root;
        trunkVertices.setGeometryVertices(trunk.geometry);
        trunk.controlPoint = trunkControlPoint;

        const head = this.addChild(this.root, this.head);
        head.landmarks = [
            // left ear
            [-headVertices.lowerX, headVertices.yRange * .05, headVertices.zRange * .15],
            // right ear
            [-headVertices.upperX, headVertices.yRange * .05, headVertices.zRange * .15],
        ];
        headVertices.translate(-headOffset[0], -headOffset[1], -headOffset[2]);
        headVertices.setGeometryVertices(head.geometry);
        head.translation = headOffset;
        head.controlPoint = headControlPoint;

        const leftUpperArm = this.addChild(this.root, this.leftUpperArm);
        leftUpperArmVertices.translate(-leftUpperArmOffset[0], -leftUpperArmOffset[1], -leftUpperArmOffset[2]);
        leftUpperArmVertices.setGeometryVertices(leftUpperArm.geometry);
        leftUpperArm.translation = leftUpperArmOffset;
        leftUpperArm.controlPoint = leftUpperArmControlPoint;

        const rightUpperArm = this.addChild(this.root, this.rightUpperArm);
        rightUpperArmVertices.translate(+leftUpperArmOffset[0], -leftUpperArmOffset[1], -leftUpperArmOffset[2]);
        rightUpperArmVertices.setGeometryVertices(rightUpperArm.geometry);
        rightUpperArm.translation = mirror(leftUpperArmOffset);
        rightUpperArm.controlPoint = mirror(leftUpperArmControlPoint);

        const leftLowerArm = this.addChild(leftUpperArm, this.leftLowerArm);
        leftLowerArmVertices.translate(
            -leftLowerArmOffset[0] - leftUpperArmOffset[0],
            -leftLowerArmOffset[1] - leftUpperArmOffset[1],
            -leftLowerArmOffset[2] - leftUpperArmOffset[2],
        );
        leftLowerArmVertices.setGeometryVertices(leftLowerArm.geometry);
        leftLowerArm.translation = leftLowerArmOffset;
        leftLowerArm.controlPoint = leftLowerArmControlPoint;

        const rightLowerArm = this.addChild(rightUpperArm, this.rightLowerArm);
        rightLowerArmVertices.translate(
            +leftLowerArmOffset[0] + leftUpperArmOffset[0],
            -leftLowerArmOffset[1] - leftUpperArmOffset[1],
            -leftLowerArmOffset[2] - leftUpperArmOffset[2],
        );
        rightLowerArmVertices.setGeometryVertices(rightLowerArm.geometry);
        rightLowerArm.translation = mirror(leftLowerArmOffset);
        rightLowerArm.controlPoint = mirror(leftLowerArmControlPoint);

        const leftHand = this.addChild(leftLowerArm, this.leftHand);
        leftHandVertices.translate(
            -leftHandOffset[0] - leftLowerArmOffset[0] - leftUpperArmOffset[0],
            -leftHandOffset[1] - leftLowerArmOffset[1] - leftUpperArmOffset[1],
            -leftHandOffset[2] - leftLowerArmOffset[2] - leftUpperArmOffset[2],
        );
        leftHandVertices.setGeometryVertices(leftHand.geometry);
        leftHand.translation = leftHandOffset;
        leftHand.controlPoint = leftHandControlPoint;

        const rightHand = this.addChild(rightLowerArm, this.rightHand);
        rightHandVertices.translate(
            +leftHandOffset[0] + leftLowerArmOffset[0] + leftUpperArmOffset[0],
            -leftHandOffset[1] - leftLowerArmOffset[1] - leftUpperArmOffset[1],
            -leftHandOffset[2] - leftLowerArmOffset[2] - leftUpperArmOffset[2],
        );
        rightHandVertices.setGeometryVertices(rightHand.geometry);
        rightHand.translation = mirror(leftHandOffset);
        rightHand.controlPoint = mirror(leftHandControlPoint);

        const leftThigh = this.addChild(trunk, this.leftThigh);
        leftThighVertices.translate(
            -leftThighOffset[0],
            -leftThighOffset[1],
            -leftThighOffset[2],
        );
        leftThighVertices.setGeometryVertices(leftThigh.geometry);
        leftThigh.translation = leftThighOffset;
        leftThigh.controlPoint = leftThighControlPoint;

        const rightThigh = this.addChild(trunk, this.rightThigh);
        rightThighVertices.translate(
            +leftThighOffset[0],
            -leftThighOffset[1],
            -leftThighOffset[2],
        );
        rightThighVertices.setGeometryVertices(rightThigh.geometry);
        rightThigh.translation = mirror(leftThighOffset);
        rightThigh.controlPoint = mirror(leftThighControlPoint);

        const leftCalf = this.addChild(leftThigh, this.leftCalf);
        leftCalfVertices.translate(
            -leftCalfOffset[0] - leftThighOffset[0],
            -leftCalfOffset[1] - leftThighOffset[1],
            -leftCalfOffset[2] - leftThighOffset[2],
        );
        leftCalfVertices.setGeometryVertices(leftCalf.geometry);
        leftCalf.translation = leftCalfOffset;
        leftCalf.controlPoint = leftCalfControlPoint;

        const rightCalf = this.addChild(rightThigh, this.rightCalf);
        rightCalfVertices.translate(
            +leftCalfOffset[0] + leftThighOffset[0],
            -leftCalfOffset[1] - leftThighOffset[1],
            -leftCalfOffset[2] - leftThighOffset[2],
        );
        rightCalfVertices.setGeometryVertices(rightCalf.geometry);
        rightCalf.translation = mirror(leftCalfOffset);
        rightCalf.controlPoint = mirror(leftCalfControlPoint);

        const leftFoot = this.addChild(leftCalf, this.leftFoot);
        leftFootVertices.translate(
            -leftFootOffset[0] - leftCalfOffset[0] - leftThighOffset[0],
            -leftFootOffset[1] - leftCalfOffset[1] - leftThighOffset[1],
            -leftFootOffset[2] - leftCalfOffset[2] - leftThighOffset[2],
        );
        leftFootVertices.setGeometryVertices(leftFoot.geometry);
        leftFoot.translation = leftFootOffset;
        leftFoot.controlPoint = leftFootControlPoint;

        const rightFoot = this.addChild(rightCalf, this.rightFoot);
        rightFootVertices.translate(
            +leftFootOffset[0] + leftCalfOffset[0] + leftThighOffset[0],
            -leftFootOffset[1] - leftCalfOffset[1] - leftThighOffset[1],
            -leftFootOffset[2] - leftCalfOffset[2] - leftThighOffset[2],
        );
        rightFootVertices.setGeometryVertices(rightFoot.geometry);
        rightFoot.translation = mirror(leftFootOffset);
        rightFoot.controlPoint = mirror(leftFootControlPoint);
    }

    private addChild(parent: SkeletonModelNode, node?: SkeletonModelNode) {
        node = node || new SkeletonModelNode();
        parent.children.push(node);
        node.parent = parent;
        return node;
    }

}