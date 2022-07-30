import * as THREE from 'three'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export class Line3D {
    constructor( _config = {} ) {
        this.config = Object.assign({radius: 0.1, height: 3, segments: 60}, _config);
        this._mesh = this.initMesh(this.config.radius, this.config.height, this.config.segments);
    }

    initMesh(radius, height, segments) {
        var geom = new THREE.CylinderGeometry(radius, radius, height, 3, segments, true);
        var material = this.config.material || Utils3D.getTestShaderMaterial('color', {});
        return new THREE.Mesh(geom, material);
    }

    initMergedMesh(radius, height, segments) {
        var ballGeo = new THREE.SphereGeometry(100,350,350);
        var material = Utils3D.getTestShaderMaterial('color', {
            side: THREE.DoubleSide,
            
        });
        var ball = new THREE.Mesh(ballGeo, material);
        ball.position.x = 200;

        var pendulumGeo = new THREE.CylinderGeometry(100, 10, 500, 160);
        ball.updateMatrix();
        pendulumGeo.merge(ball.geometry, ball.matrix);


        const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(
            [pendulumGeo, ballGeo], false);
        
        var mesh = new THREE.Mesh(mergedGeometry, material);

        return mesh;
    }

    //* Event handlers */

    //* Public methods */
}