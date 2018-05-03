import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, EventEmitter, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ModalComponent } from '../modal/modal.component';

import * as THREE from 'three';
var TrackballControls = require('three-trackballcontrols');

const r = 450;
let angle = 0;

const config = {
    up : false,
    count : 0,
    layers : 10,
    current_layer : 0,
    offset : 1,
    delay : 2,
    range : 2,
    resolution_circle : 30,
    resolution_active : 50,
    line_parameters : [
        [ 4.5, 0xffffff, 0.38, 1 ],
        [ 5.0, 0xaaaaaa, 0.25, 2 ],
        [ 5.5, 0xffffff, 0.25, 1 ],
        [ 6.0, 0xffffff, 0.25, 1 ],
        [ 7.0, 0xffffff, 0.125, 1 ]
    ],
    circles : [
        [ 700, 177, 10 ],
        [ 400, 151, 6 ],
        [ 200, 131, 5 ],
        [ 100, 101, 3 ]
    ],
    actives : [7, 175, 13],
    environment : 1000
}

@Component({
  selector: 'app-three',
  templateUrl: './three.component.html',
  styleUrls: ['./three.component.scss']
})
export class ThreeComponent implements AfterViewInit {

    constructor(private dialog : MatDialog) { }

    ngAfterViewInit() {
        this.createScene();
        setTimeout(() => this.animate(), 500);
    }


    @ViewChild('canvas')
    private canvasRef : ElementRef;

    private main_sphere : THREE.Object3D;

    private active : THREE.Object3D;

    private renderer : THREE.WebGLRenderer;

    private scene : THREE.Scene;

    private camera : THREE.PerspectiveCamera;

    private mouseDown : boolean = false;

    private controls : any;

    private clock : THREE.Clock;

    //----------------lightning------------------

    objects  = [];
    keys = [];

    active_key : number;

    //----------------camera config---------------
    public cameraZ: number = 500;
    public fieldOfView: number = 80;
    public nearClippingPane: number = 1;
    public farClippingPane: number = 2000;

    //----------------mouse -------------------

    mouse = null;

    //---------------mouse events-----------------
    @HostListener('mouseup')
    onMouseup() {
        if(!this.mouse)
            return
        const dialogRef = this.dialog.open(ModalComponent);
        dialogRef.componentInstance.data = this.active_key;
    }

    @HostListener('mousemove', ['$event'])
    onMousemove(event: MouseEvent) {
        event.preventDefault();

        let raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.mouse.x = ( event.clientX / this.canvas.clientWidth ) * 2 - 1;
        this.mouse.y =  - ( event.clientY / this.canvas.clientHeight ) * 2 + 1;

        raycaster.setFromCamera( this.mouse, this.camera );

        let intersects = raycaster.intersectObjects( this.objects );

        if ( intersects.length > 0 ) {
            this.canvas.style.cursor = "pointer";
            let id = this.objects.indexOf(intersects[0].object);
            this.active_key = this.keys[id];
            return;
        }
        else{
            this.canvas.style.cursor = "default";
            this.mouse = null;
        }
    }

    private get canvas() : HTMLCanvasElement{
        return  this.canvasRef.nativeElement;
    }

    private getAspectRatio() {
        return this.canvas.clientWidth / this.canvas.clientHeight;
    }

    createScene() {
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

        this.controls = new TrackballControls(this.camera);
		this.controls.rotateSpeed = 2.0;
		this.controls.zoomSpeed = 1.2;
	    this.controls.panSpeed = 0.8;

		this.controls.staticMoving = true;

        this.clock = new THREE.Clock();

        this.addObjectsToScene();

        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
        this.renderer.setPixelRatio(devicePixelRatio);
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.sortObjects = false;
        this.renderer.render( this.scene, this.camera );
    }

    animate() {

        let component: ThreeComponent = this;
        (
            function render() {
                requestAnimationFrame(render);
                component.render();
            }()
        );
    }

    onResize() {

        this.camera.aspect = this.getAspectRatio();
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    }

    createActiveObject(n, radius, cn){

        config.current_layer = config.layers/config.offset - 1;

        let vector = new THREE.Vector3();
      	let spherical = new THREE.Spherical();
        let group = new THREE.Object3D();

      	for ( let i = 1; i < n; i ++ ) {
      		let phi = Math.acos( -1 + ( 2 * i ) / n );
      		let theta = Math.sqrt( n * Math.PI ) * phi;
            let object = new THREE.Object3D();

            spherical.set( radius, phi, theta );
            object.position.setFromSpherical( spherical );
            vector.copy( object.position ).multiplyScalar( 2 );
            object.lookAt( vector );

            let opacity = 1;
            let layers = new THREE.Object3D();

            for(let j = 1 ; j <= cn; j += config.offset)
            {
                let color =  0xd82D33 ;
                let geometry = new THREE.SphereGeometry(j, config.resolution_active, config.resolution_active);
                let material = new THREE.MeshBasicMaterial( { color: color, opacity: opacity, transparent: true } );
                let sphere = new THREE.Mesh(geometry, material);

                sphere.position.x = object.position.x, sphere.position.y = object.position.y, sphere.position.z = object.position.z;

                layers.add( sphere );
                this.objects.push( sphere );
                this.keys.push(i-1);

                opacity -= 1/config.layers * config.offset;
            }
            group.add(layers);
      	}
        return group;
    }

    createCircle(n, radius, cn, rot = true){
        let vector = new THREE.Vector3();
      	let spherical = new THREE.Spherical();
        let group = new THREE.Object3D();
      	for ( let i = 0; i < n ; i ++ ) {
      		let phi = Math.acos( -1 + ( 2 * i ) / n );
      		let theta = Math.sqrt( n * Math.PI ) * phi;
            let d = (i % 31) == 0 ? cn : cn/3;

            let geo = new THREE.CircleGeometry( Math.random()%d*d, config.resolution_circle);
            let color = i % 3 == 0 ? 0xd82D33 : i % 3 == 1 ? 0x626261 : 0xffffff;
            let material = new THREE.MeshBasicMaterial( { color: color } );
            let circle = new THREE.Mesh( geo, material );

            let object = new THREE.Object3D();

            spherical.set( radius, phi, theta );
            object.position.setFromSpherical( spherical );
            vector.copy( object.position ).multiplyScalar( 2 );
            object.lookAt( vector );

            circle.position.x = object.position.x, circle.position.y = object.position.y, circle.position.z = object.position.z;
            if(rot)
                circle.rotation.x = object.rotation.x, circle.rotation.y = object.rotation.y, circle.rotation.z = object.rotation.z;

            group.add( circle );
      	}
        return group;
    }

    createGeometry() {
        let geometry = new THREE.Geometry();
        for ( var i = 0; i < config.environment; i ++ )
        {
        	var vertex1 = new THREE.Vector3();
        	vertex1.x = Math.random() * 2 - 1;
        	vertex1.y = Math.random() * 2 - 1;
        	vertex1.z = Math.random() * 2 - 1;
        	vertex1.normalize();
        	vertex1.multiplyScalar( r );
        	let vertex2 = vertex1.clone();
        	vertex2.multiplyScalar( Math.random() * 0.01 + 1 );
        	geometry.vertices.push( vertex1 );
        	geometry.vertices.push( vertex2 );
        }
        return geometry;
    }

    addObjectsToScene(){
        let geometry = this.createGeometry();
        for(let i = 0; i < config.line_parameters.length; ++ i ) {
            let p = config.line_parameters[ i ];
            let material = new THREE.LineBasicMaterial( { color: p[ 1 ], opacity: p[ 2 ], linewidth: p[ 3 ] } );
            let line = new THREE.LineSegments( geometry, material );
            line.scale.x = line.scale.y = line.scale.z = p[ 0 ];
            line['originalScale'] = p[ 0 ];
            line.rotation.y = Math.random() * Math.PI;
            line.updateMatrix();

            this.scene.add( line );
        }

        this.main_sphere = new THREE.Object3D();
        this.active = new THREE.Object3D();

        for(let param of config.circles)
            this.main_sphere.add(this.createCircle(param[0], param[1], param[2]));

        this.active = this.createActiveObject(config.actives[0], config.actives[1], config.actives[2]);

        this.main_sphere.add(this.active);
        this.scene.add(this.main_sphere);
    }

    render() {

        const delta = this.clock.getDelta();
        this.controls.update(delta);
        this.camera.lookAt( this.scene.position );
        this.renderer.render( this.scene, this.camera );

        //-----------------------sphere rotation---------------------
        this.main_sphere.rotation.x = r * Math.cos( angle );
        this.main_sphere.rotation.z = r * Math.sin( angle );
        angle += 0.00002;

        //---------------------environment-----------------------
        let time = Date.now() * 0.0001;
        for ( let i = 0; i < this.scene.children.length; i ++ )
        {
        	var object = this.scene.children[ i ];
        	if ( object instanceof THREE.Line )
            {
        		object.rotation.x = object.rotation.y = object.rotation.z = time * (  - ( i + 1 ) ) ;
        		object.scale.x = object.scale.y = - object['originalScale'] / 2 * (i/5+1) * (1 + 0.5 * Math.sin( 7*time ));
        	}
        }

        //--------------------active spheres lightning---------------
        if((++config.count) % config.delay != 0)
            return;

        for(let circle of this.active.children)
        {
            if(config.up)
                circle.children[config.current_layer].visible = true;
            else
                circle.children[config.current_layer].visible = false;
        }

        config.up ? config.current_layer++ : config.current_layer--;

        if(config.current_layer == this.active.children[0].children.length - 1 && config.up)
            config.up = false;
        else if(config.current_layer == config.range && !config.up)
            config.up = true;
	}
}
