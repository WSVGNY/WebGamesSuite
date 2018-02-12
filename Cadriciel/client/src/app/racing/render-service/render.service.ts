import { Injectable } from "@angular/core";
import Stats = require("stats.js");
import {
    PerspectiveCamera, WebGLRenderer, Scene, AmbientLight, /*Matrix4, Vector3,*/
    MeshBasicMaterial, Mesh, PlaneGeometry, Color, TextureLoader,
    MeshLambertMaterial, VertexColors, Texture, FogExp2, Geometry, Vector3
} from "three";
import { Car } from "../car/car";
// import { Track } from "../../../../../common/racing/track";
// import { TrackService } from "../track-service/track.service";
import { DEG_TO_RAD, /*RAD_TO_DEG*/ } from "../constants";

const FAR_CLIPPING_PLANE: number = 1000;
const NEAR_CLIPPING_PLANE: number = 1;
const FIELD_OF_VIEW: number = 70;

const ACCELERATE_KEYCODE: number = 87;  // w
const LEFT_KEYCODE: number = 65;        // a
const BRAKE_KEYCODE: number = 83;       // s
const RIGHT_KEYCODE: number = 68;       // d

const INITIAL_CAMERA_POSITION_Z: number = 10;
const INITIAL_CAMERA_POSITION_Y: number = 5;
const WHITE: number = 0xFFFFFF;
const AMBIENT_LIGHT_OPACITY: number = 0.5;
const TEMP_GRID_SIZE: number = 100;
const TEMP_GRID_ORIENTATION: number = 90;
const TABLEAU: Array<Vector3> = new Array<Vector3>();

const PLAYER_CAMERA: string = "PLAYER_CAMERA";

@Injectable()
export class RenderService {
    private camera: PerspectiveCamera;
    private container: HTMLDivElement;
    private _car: Car;
    private renderer: WebGLRenderer;
    private scene: Scene;
    private stats: Stats;
    private lastDate: number;
    /*private tracks: Track[];
    private trackService: TrackService;*/

    public get car(): Car {
        return this._car;
    }

    public constructor() {
        this._car = new Car();
    }

    public async initialize(container: HTMLDivElement): Promise<void> {
        if (container) {
            this.container = container;
        }

        await this.createScene();
        this.initStats();
        this.startRenderingLoop();
    }

    private initStats(): void {
        this.stats = new Stats();
        this.stats.dom.style.position = "absolute";
        this.container.appendChild(this.stats.dom);
    }

    private update(): void {
        const timeSinceLastFrame: number = Date.now() - this.lastDate;
        this._car.update(timeSinceLastFrame);
        this.lastDate = Date.now();
    }

    private async createScene(): Promise<void> {
        this.scene = new Scene();
        await this._car.init();
        this.scene.add(this._car);

        this.camera = new PerspectiveCamera(
            FIELD_OF_VIEW,
            this.getAspectRatio(),
            NEAR_CLIPPING_PLANE,
            FAR_CLIPPING_PLANE
        );
        this.camera.name = PLAYER_CAMERA;
        this.camera.position.z = INITIAL_CAMERA_POSITION_Z;
        this.camera.position.y = INITIAL_CAMERA_POSITION_Y;
        this._car.attachCamera(this.camera);

        const groundGeometry: PlaneGeometry = new PlaneGeometry(TEMP_GRID_SIZE, TEMP_GRID_SIZE, TEMP_GRID_SIZE, TEMP_GRID_SIZE);
        const groundMaterial: MeshBasicMaterial = new MeshBasicMaterial({ wireframe: true, color: 0x00FF00 });
        const ground: Mesh = new Mesh(groundGeometry, groundMaterial);
        ground.rotateX(DEG_TO_RAD * TEMP_GRID_ORIENTATION);
        // ground.position = new Vector3(0, 0 , -1); marche po !! better use ground.translate()
        this.scene.add(ground);
        this.scene.add(new AmbientLight(WHITE, AMBIENT_LIGHT_OPACITY));
        await this.renderTrack();
    }

    private getAspectRatio(): number {
        return this.container.clientWidth / this.container.clientHeight;
    }

    private startRenderingLoop(): void {
        this.renderer = new WebGLRenderer();
        this.renderer.setPixelRatio(devicePixelRatio);
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);

        this.lastDate = Date.now();
        this.container.appendChild(this.renderer.domElement);
        this.render();
    }

    private render(): void {
        requestAnimationFrame(() => this.render());
        this.update();
        this.renderer.render(this.scene, this.camera);
        this.stats.update();
    }

    public onResize(): void {
        this.camera.aspect = this.getAspectRatio();
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    public handleKeyDown(event: KeyboardEvent): void {
        switch (event.keyCode) {
            case ACCELERATE_KEYCODE:
                this._car.isAcceleratorPressed = true;
                break;
            case LEFT_KEYCODE:
                this._car.steerLeft();
                break;
            case RIGHT_KEYCODE:
                this._car.steerRight();
                break;
            case BRAKE_KEYCODE:
                this._car.brake();
                break;
            default:
                break;
        }
    }

    public handleKeyUp(event: KeyboardEvent): void {
        switch (event.keyCode) {
            case ACCELERATE_KEYCODE:
                this._car.isAcceleratorPressed = false;
                break;
            case LEFT_KEYCODE:
            case RIGHT_KEYCODE:
                this._car.releaseSteering();
                break;
            case BRAKE_KEYCODE:
                this._car.releaseBrakes();
                break;
            default:
                break;
        }
    }

    /*private getTracksFromServer(): void {
        this.trackService.getTrackList()
            .subscribe((tracks: Track[]) => this.tracks = tracks);
    }*/

    private async renderTrack(): Promise<void> {
        // this.getTracksFromServer();
        this.scene.background = new Color(0xFFFFFF);
        this.scene.fog = new FogExp2(0xFFFFFF, 0.00015);
        const ambientLight: AmbientLight = new AmbientLight(0xCCCCCC);
        this.scene.add(ambientLight);
        // const image = new Image();
        const texture1: Texture = await this.load1();
        const texture2: Texture = await this.load2();
        const trackWall: Mesh = new Mesh(this.createGeometry(), new MeshLambertMaterial({ map: texture1, vertexColors: VertexColors }));
        // trackWall.position = new Vector3(0 , 1 , 0);
        const trackWall2: Mesh = new Mesh(this.createGeometry(), new MeshLambertMaterial({ map: texture2, vertexColors: VertexColors }));
        trackWall.translate(5, new Vector3(-1, 0, 0));
        trackWall.rotateY(-3.14 / 2);
        trackWall.rotateX(-3.14 / 2);
        trackWall.rotateZ(3.14 / 2);

        trackWall.translate(5, new Vector3(0, 1, 0));
        trackWall2.translate(5, new Vector3(1, 1, 1));
        trackWall2.rotateY(-3.14 / 2);
        this.scene.add(trackWall);
        this.scene.add(trackWall2);
    }

    private createGeometry(): Geometry {
        // const matrix: Matrix4 = new Matrix4();
        // const light: Color = new Color(0xFFFFFF);
        // const shadow: Color = new Color(0x505050);
        const wallGeometry: PlaneGeometry = new PlaneGeometry(100, 10);
        // wallGeometry.rotateY(Math.PI / 2);

        return wallGeometry;
    }

    private async load1(): Promise<Texture> {
        return new Promise<Texture>((resolve, reject) => {
            const loader: TextureLoader = new TextureLoader();
            loader.load("assets/textures/green.png", (object) => {
                resolve(object);
            });
        });
    }

    private async load2(): Promise<Texture> {
        return new Promise<Texture>((resolve, reject) => {
            const loader: TextureLoader = new TextureLoader();
            loader.load("assets/textures/world3.jpg", (object) => {
                resolve(object);
            });
        });
    }

    public remplirTableau(): void {
        TABLEAU.push(new Vector3(0, 1, 0));
        TABLEAU.push(new Vector3(0, 5, 0));
        TABLEAU.push(new Vector3(2, 8, 0));
        TABLEAU.push(new Vector3(4, 8, 0));

    }
}
