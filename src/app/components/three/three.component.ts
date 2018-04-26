import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import * as THREE from 'three';

const r = 450;
let angle = 0;

@Component({
  selector: 'app-three',
  templateUrl: './three.component.html',
  styleUrls: ['./three.component.scss']
})
export class ThreeComponent implements AfterViewInit {

    constructor() { }

    ngAfterViewInit() {
        this.createScene();
        setTimeout(() => this.animate(), 500);
    }


    @ViewChild('canvas')
    private canvasRef : ElementRef;

    private cube : THREE.Mesh;

    private renderer : THREE.WebGLRenderer;

    private scene : THREE.Scene;

    private camera : THREE.PerspectiveCamera;

    private get canvas() : HTMLCanvasElement{
      return  this.canvasRef.nativeElement;
    }

    private getAspectRatio() {
    return this.canvas.clientWidth / this.canvas.clientHeight;
    }

    public size : number = 200;
    public cameraZ: number = 500;
    public fieldOfView: number = 70;
    public nearClippingPane: number = 1;
    public farClippingPane: number = 3000;


    private createScene() {

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x320A32 );

        let aspectRatio = this.getAspectRatio();
        this.camera = new THREE.PerspectiveCamera(
          this.fieldOfView,
          aspectRatio,
          this.nearClippingPane,
          this.farClippingPane
        );
        this.camera.position.z = this.cameraZ;

        var parameters = [
            [ 4.0,   0xffffff, 0.25, 1 ],
            [ 4.5, 0xffffff, 0.38, 1 ],
            [ 5.0, 0xaaaaaa, 0.25, 2 ],
            [ 5.5, 0xffffff, 0.25, 1 ],
            [ 6.5, 0xffffff, 0.25, 1 ],
            [ 7.0, 0xffffff, 0.125, 1 ]
        ];

        var geometry = this.createGeometry();
        for(let i = 0; i < parameters.length; ++ i ) {
            let p = parameters[ i ];
            let material = new THREE.LineBasicMaterial( { color: p[ 1 ], opacity: p[ 2 ], linewidth: p[ 3 ] } );
            let line = new THREE.LineSegments( geometry, material );
            line.scale.x = line.scale.y = line.scale.z = p[ 0 ];
            line['originalScale'] = p[ 0 ];
            line.rotation.y = Math.random() * Math.PI;
            line.updateMatrix();

            this.scene.add( line );
        }

        this.createCircle(1000, 200, 14, true);
        this.createCircle(400, 180, 5, true);
        this.createCircle(300, 150, 3, true);
        this.createCircle(100, 40, 1, true);

        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
        this.renderer.setPixelRatio(devicePixelRatio);
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.render( this.scene, this.camera );
    }

    private animate() {

        let component: ThreeComponent = this;
        (
            function render() {
                requestAnimationFrame(render);
                component.render();
            }()
        );
    }

    public onResize() {
        this.camera.aspect = this.getAspectRatio();
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    }

    public createCircle(n, radius, cn, rot = false){
        var vector = new THREE.Vector3();
      	var spherical = new THREE.Spherical();
      	for ( let i = 0; i < n; i ++ ) {
      		var phi = Math.acos( -1 + ( 2 * i ) / n );
      		var theta = Math.sqrt( n * Math.PI ) * phi;
            var d = (i % 21) == 0 ? cn : cn/3;
            var geo = new THREE.CircleGeometry( Math.random()%d*d, 100);
            var color = i % 3 == 0 ? 0xd82D33 : i % 3 == 1 ? 0x626261 : 0xffffff;
            var material = new THREE.MeshBasicMaterial( { color: color } );
            var circle = new THREE.Mesh( geo, material );

            var object = new THREE.Object3D();

            spherical.set( radius, phi, theta );
            object.position.setFromSpherical( spherical );
            vector.copy( object.position ).multiplyScalar( 2 );
            object.lookAt( vector );

            circle.position.x = object.position.x, circle.position.y = object.position.y, circle.position.z = object.position.z;
            if(rot)
                circle.rotation.x = object.rotation.x, circle.rotation.y = object.rotation.y, circle.rotation.z = object.rotation.z;

            this.scene.add( circle );
      	}
    }

    public createGeometry() {
        var geometry = new THREE.Geometry();
        for ( var i = 0; i < 1000; i ++ )
        {
        	var vertex1 = new THREE.Vector3();
        	vertex1.x = Math.random() * 2 - 1;
        	vertex1.y = Math.random() * 2 - 1;
        	vertex1.z = Math.random() * 2 - 1;
        	vertex1.normalize();
        	vertex1.multiplyScalar( r );
        	var vertex2 = vertex1.clone();
        	vertex2.multiplyScalar( Math.random() * 0.01 + 1 );
        	geometry.vertices.push( vertex1 );
        	geometry.vertices.push( vertex2 );
        }
        return geometry;
    }

    render() {
        var rt = r * Math.cos( angle );

        this.camera.position.x = ;
        this.camera.position.y = r * Math.cos( angle );
        this.camera.position.z = r * Math.sin( angle );
        angle += 0.03;
        this.camera.lookAt( this.scene.position );
        this.renderer.render( this.scene, this.camera );
        var time = Date.now() * 0.0001;
        for ( var i = 0; i < this.scene.children.length; i ++ ) {
        	var object = this.scene.children[ i ];
        	if ( object instanceof THREE.Line ) {
        		object.rotation.y = time * ( i < 4 ? ( i + 1 ) : - ( i + 1 ) ) ;
        		if ( i < 5 ) object.scale.x = object.scale.y = object.scale.z = object['originalScale'] / 2 * (i/5+1) * (1 + 0.5 * Math.sin( 7*time ) );
        	}
        }
	}
}
