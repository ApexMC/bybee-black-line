"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import type { MeshPhysicalMaterial } from "three";

export function FinishStudio() {
  const container = useRef<HTMLDivElement>(null);
  const bodyMaterial = useRef<MeshPhysicalMaterial | null>(null);
  const controlRef = useRef<{ autoRotate: boolean; reset: () => void } | null>(null);
  const [finish, setFinish] = useState("black");
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    const host = container.current;
    if (!host) return;
    async function init() {
      const [THREE, { GLTFLoader }, { DRACOLoader }, { OrbitControls }, { RoomEnvironment }] = await Promise.all([
        import("three"), import("three/addons/loaders/GLTFLoader.js"), import("three/addons/loaders/DRACOLoader.js"),
        import("three/addons/controls/OrbitControls.js"), import("three/addons/environments/RoomEnvironment.js"),
      ]);
      if (disposed || !host) return;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      host.appendChild(renderer.domElement);
      renderer.domElement.setAttribute("aria-label", "Interactive sports car. Drag left or right to rotate.");
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
      camera.position.set(5.1, 2.2, -7.1);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 0.6, 0);
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minPolarAngle = Math.PI / 3;
      controls.maxPolarAngle = Math.PI / 2.15;
      controls.autoRotate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      controls.autoRotateSpeed = 0.25;
      setPlaying(controls.autoRotate);
      controls.update();
      controls.saveState();
      controlRef.current = controls;
      const pmrem = new THREE.PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      const environment = pmrem.fromScene(room, 0.04);
      scene.environment = environment.texture;
      scene.environmentIntensity = 0.85;
      room.dispose();
      pmrem.dispose();
      const key = new THREE.DirectionalLight(0xffffff, 1.6);
      key.position.set(-3, 7, -3);
      scene.add(key, new THREE.AmbientLight(0xffffff, 0.4));
      const fill = new THREE.DirectionalLight(0xcad6ed, 1.1);
      fill.position.set(5, 3, 2);
      scene.add(fill);
      const floor = new THREE.Mesh(new THREE.CircleGeometry(3.9, 100), new THREE.MeshBasicMaterial({ color: 0x1c2027, transparent: true, opacity: 0.14 }));
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -0.035;
      scene.add(floor);
      const ring = new THREE.Mesh(new THREE.RingGeometry(3.25, 3.257, 150), new THREE.MeshBasicMaterial({ color: 0x80858c, transparent: true, opacity: 0.22, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -0.027;
      scene.add(ring);
      const body = new THREE.MeshPhysicalMaterial({ color: 0x17191c, metalness: 0.95, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.04 });
      bodyMaterial.current = body;
      const trim = new THREE.MeshStandardMaterial({ color: 0x858b96, metalness: 1, roughness: 0.28 });
      const interior = new THREE.MeshStandardMaterial({ color: 0x101216, metalness: 0.05, roughness: 0.85 });
      const glass = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0.05,
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
      });
      const draco = new DRACOLoader();
      draco.setDecoderPath("/draco/");
      const loader = new GLTFLoader();
      loader.setDRACOLoader(draco);
      const resize = () => {
        if (!host) return;
        const width = host.clientWidth;
        const height = host.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      const observer = new ResizeObserver(resize);
      observer.observe(host);
      resize();
      let visible = true;
      const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
      intersection.observe(host);
      const pauseOnHide = () => { visible = !document.hidden; };
      document.addEventListener("visibilitychange", pauseOnHide);
      const started = performance.now();
      renderer.setAnimationLoop(() => {
        if (!visible) return;
        controls.autoRotateSpeed = 0.55 * Math.cos((performance.now() - started) * 0.00017);
        controls.update();
        renderer.render(scene, camera);
      });
      cleanup = () => {
        renderer.setAnimationLoop(null);
        observer.disconnect();
        intersection.disconnect();
        document.removeEventListener("visibilitychange", pauseOnHide);
        controls.dispose();
        draco.dispose();
        environment.dispose();
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach((material) => { Object.values(material).forEach((value) => { if (value instanceof THREE.Texture) value.dispose(); }); material.dispose(); });
          }
        });
        body.dispose(); trim.dispose(); glass.dispose(); interior.dispose();
        renderer.dispose();
        renderer.domElement.remove();
        bodyMaterial.current = null;
        controlRef.current = null;
      };
      loader.load("/models/ferrari.glb", (gltf) => {
        if (disposed) { gltf.scene.traverse((object) => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => material.dispose()); } }); return; }
        const car = gltf.scene.children[0];
        const setMaterial = (name: string, material: import("three").Material) => { const mesh = car.getObjectByName(name); if (mesh instanceof THREE.Mesh) { (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((old) => old.dispose()); mesh.material = material; } };
        setMaterial("body", body);
        ["rim_fl", "rim_fr", "rim_rr", "rim_rl", "chrome"].forEach((name) => setMaterial(name, trim));
        ["trim", "steering_trim", "leather", "interior_light", "interior_dark", "carpet", "carbon_fibre_trim", "carbon fibre", "steering_carbon"].forEach((name) => setMaterial(name, interior));
        setMaterial("glass", glass);
        const shadowTexture = new THREE.TextureLoader().load("/models/ferrari-ao.png");
        const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.62, 5.2), new THREE.MeshBasicMaterial({ map: shadowTexture, blending: THREE.MultiplyBlending, toneMapped: false, premultipliedAlpha: true, transparent: true, opacity: 0.7, depthWrite: false }));
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.005;
        car.add(shadow);
        scene.add(car);
        renderer.render(scene, camera);
        setReady(true);
      }, undefined, () => { if (!disposed) setFailed(true); });
    }
    init().catch(() => { if (!disposed) setFailed(true); });
    return () => { disposed = true; cleanup(); };
  }, []);

  function changeFinish(value: string) {
    setFinish(value);
    bodyMaterial.current?.color.set(value === "black" ? 0x17191c : 0x9b9fa5);
  }

  return <div className="finish-studio">
    <div className="studio-halo" />
    <div className={`studio-fallback ${ready ? "is-hidden" : ""}`} aria-hidden={ready}>
      <img src="/images/car-detail.jpg" alt="Silver sports car showing a carefully finished exterior" />
    </div>
    <div ref={container} className={`studio-canvas ${ready ? "is-ready" : ""}`} role="img" aria-label="3D automotive finish studio" />
    {!ready && !failed && <div className="studio-corner">Loading car view</div>}
    <div className="studio-controls">
      <div className="studio-finish-label"><strong>{finish === "black" ? "Black" : "Silver"}</strong></div>
      <div className="finish-swatches" aria-label="Choose a paint finish">
        <button className={`swatch black ${finish === "black" ? "active" : ""}`} aria-label="Black finish" aria-pressed={finish === "black"} onClick={() => changeFinish("black")} disabled={!ready} />
        <button className={`swatch silver ${finish === "silver" ? "active" : ""}`} aria-label="Silver finish" aria-pressed={finish === "silver"} onClick={() => changeFinish("silver")} disabled={!ready} />
      </div>
      <span className="control-divider" />
      <button className="studio-icon" disabled={!ready} aria-label={playing ? "Pause rotation" : "Start rotation"} onClick={() => { if (controlRef.current) { controlRef.current.autoRotate = !playing; setPlaying(!playing); } }}>{playing ? <Pause size={14} /> : <Play size={14} />}</button>
      <button className="studio-icon" disabled={!ready} aria-label="Reset car view" onClick={() => controlRef.current?.reset()}><RotateCcw size={14} /></button>
    </div>
    <p className="studio-hint"><span>↔</span> DRAG TO ROTATE</p>
  </div>;
}
