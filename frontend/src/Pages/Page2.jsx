import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from "ogl";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; 

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1, p2, t) {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance) {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach((key) => {
    if (key !== "constructor" && typeof instance[key] === "function") {
      instance[key] = instance[key].bind(instance);
    }
  });
}

function createTextTexture(gl, text, font = "bold 30px monospace", color = "black") {
  const isSmall = window.innerWidth <= 349;
  font = isSmall ? "bold 10px monospace" : font;



  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context.font = font;
  const metrics = context.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const textHeight = Math.ceil(parseInt(font, 10) * 1.2);
  canvas.width = textWidth + 20;
  canvas.height = textHeight + 20;
  context.font = font;
  context.fillStyle = color;
  context.textBaseline = "middle";
  context.textAlign = "center";
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

class Title {
  constructor({ gl, plane, renderer, text, textColor = "#545050", font = "30px sans-serif" }) {
    autoBind(this);
    this.gl = gl;
    this.plane = plane;
    this.renderer = renderer;
    this.text = text;
    this.textColor = textColor;
    this.font = font;
    this.createMesh();
  }
  createMesh() {
    const { texture, width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor);
    const geometry = new Plane(this.gl);
    const program = new Program(this.gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true,
    });
    this.mesh = new Mesh(this.gl, { geometry, program });
    const aspect = width / height;
    const textHeight = this.plane.scale.y * 0.15;
    const textWidth = textHeight * aspect;
    this.mesh.scale.set(textWidth, textHeight, 1);
    this.mesh.position.y = -this.plane.scale.y * 0.5 - textHeight * 0.5 - 0.05;
    this.mesh.setParent(this.plane);
  }
}

class Media {
  constructor({
    geometry,
    gl,
    image,
    index,
    length,
    renderer,
    scene,
    screen,
    text,
    viewport,
    bend,
    textColor,
    borderRadius = 0,
    font,
  }) {
    this.extra = 0;
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.viewport = viewport;
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;
    this.createShader();
    this.createMesh();
    this.createTitle();
    this.onResize();
  }
  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: false });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;
        
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }
        
        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);
          
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          if(d > 0.0) {
            discard;
          }
          
          gl_FragColor = vec4(color.rgb, 1.0);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius },
      },
      transparent: true,
    });
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };
  }
  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    });
    this.plane.setParent(this.scene);
  }
  createTitle() {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: this.text,
      textColor: this.textColor,
      fontFamily: this.font,
    });
  }
  update(scroll, direction) {
    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);

      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    if (direction === "right" && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === "left" && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }
  onResize({ screen, viewport } = {}) {
  // Step 1: Update screen and viewport references
  if (screen) this.screen = screen;
  if (viewport) {
    this.viewport = viewport;

    // Update uViewportSizes uniform if available
    if (this.plane.program.uniforms.uViewportSizes) {
      this.plane.program.uniforms.uViewportSizes.value = [
        this.viewport.width,
        this.viewport.height,
      ];
    }
  }

  // Step 2: Set scale factor based on screen width
  const isVerySmall = this.screen.width <= 350;
  const isMobile = this.screen.width <= 768;
  const scaleFactor = isVerySmall ? 0.6 : isMobile ? 0.75 : 1;

  this.scale = (this.screen.height / 1500) * scaleFactor;

  // Step 3: Use custom size if passed from App
  const {
    width: customWidth = 700,
    height: customHeight = 900,
  } = this.customSize || {};

  // Step 4: Scale the mesh (container)
  this.plane.scale.y =
    (this.viewport.height * (customHeight * this.scale)) /
    this.screen.height;
  this.plane.scale.x =
    (this.viewport.width * (customWidth * this.scale)) /
    this.screen.width;

  // Step 5: Update plane size uniforms
  if (this.plane.program.uniforms.uPlaneSizes) {
    this.plane.program.uniforms.uPlaneSizes.value = [
      this.plane.scale.x,
      this.plane.scale.y,
    ];
  }

  // Step 6: Positioning logic
  this.padding = 2;
  this.width = this.plane.scale.x + this.padding;
  this.widthTotal = this.width * this.length;
  this.x = this.width * this.index;
}

}

class App {
  constructor(
    container,
    {
      items,
      bend,
      textColor = "#ffffff",
      borderRadius = 0,
      font = "bold 30px Figtree",
      scrollSpeed = 2,
      scrollEase = 0.05,
      onClick = () => {}, // must be passed!
    } = {}
  ){
    document.documentElement.classList.remove("no-js");
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onCheckDebounce = debounce(this.onCheck, 200);
    this.onClick = typeof onClick === "function" ? onClick : () => {};
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, textColor, borderRadius, font);
    this.update();
    this.addEventListeners();
    this.boundOnClick = this.onClickHandler.bind(this);
    window.addEventListener("click", this.boundOnClick);
    
  }
  onClickHandler(e) {
    const x = (e.clientX / this.gl.canvas.width) * 2 - 1;
    const y = -(e.clientY / this.gl.canvas.height) * 2 + 1;

    // Loop through all Media items and check bounds
    for (const media of this.medias) {
      const mesh = media.plane;

      // Get bounding box
      const scale = mesh.scale;
      const pos = mesh.position;

      // Project position to NDC space
      const ndcX = (pos.x / this.viewport.width) * 2;
      const ndcY = (pos.y / this.viewport.height) * 2;

      // Check hit
      if (
        x > ndcX - scale.x / this.viewport.width &&
        x < ndcX + scale.x / this.viewport.width &&
        y > ndcY - scale.y / this.viewport.height &&
        y < ndcY + scale.y / this.viewport.height
      ) {
        // Call parent handler
        this.onClick(media);
        break;
      }
    }
  }

  createRenderer() {
    this.renderer = new Renderer({ alpha: true });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.gl.canvas);
  }
  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }
  createScene() {
  this.scene = new Transform();

  // Check for mobile screen size
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    this.scene.position.y = 2.5; // Shift upward for mobile
  } else {
    this.scene.position.y = 0; // Centered for desktop
  }
}

  createGeometry() {
  const isMobile = window.innerWidth <= 768;
  this.planeGeometry = new Plane(this.gl, {
    heightSegments: isMobile ? 20 : 50,
    widthSegments: isMobile ? 40 : 100,
  });
}

  createMedias(items, bend = 1, textColor, borderRadius, font) {
    const defaultItems = [
     
       { image: `https://media.istockphoto.com/id/1285898933/photo/tall-buddha-statue-in-andhra-pradesh-state-amaravathi-india.jpg?s=612x612&w=0&k=20&c=3R939IZv0lNRZSTOCXB4KLvrFJgzJG08bjdC2M-gBy8=`,
         text: "Andhra Pradesh" },
      { image: `https://media.istockphoto.com/id/187510803/photo/ancient-buddhist-monastery-tawang-arunachal-pradesh-india.jpg?s=612x612&w=0&k=20&c=9D5fAOcKj_sRhBOzNIxEhvhE8h38KbhvFWA9iagrcqw=`, 
        text: "Arunachal Pradesh	" },
      { image: `https://media.istockphoto.com/id/2154949117/photo/beautiful-tea-garden.webp?a=1&b=1&s=612x612&w=0&k=20&c=jWPdumYP7zov17GuSY096sgCXktCPgbQ8nQEo1LOs34=`, 
        text: "Assam" },
      { image: `https://media.istockphoto.com/id/505519489/photo/nalanda-university-bihar-ruin.jpg?s=612x612&w=0&k=20&c=wzg_b8wzmX393rMWd5Hyc5Hqvn3iQldWen-zY_55Pu4=`, 
        text: "Bihar" },
      { image: `https://media.istockphoto.com/id/1302634708/photo/chitrakote-falls.jpg?s=612x612&w=0&k=20&c=oTDL3KpZ2K8OBYWD-6o6XFlAR40MR1sVhgcllapRAbY=`, 
        text: "Chhattisgarh" },
      { image: `https://www.shutterstock.com/image-photo/vacation-tropical-countries-beach-chairs-600nw-531167029.jpg`, 
        text: "Goa" },
      { image: `https://media.gettyimages.com/id/99641451/photo/sun-temple-at-modhera.jpg?s=612x612&w=0&k=20&c=lMQkSz9FknM4KpNRbd-XLX8gA453TMkV7b0Hm9sXB-Y=`, 
        text: "Gujarat" },
      { image: `https://tse1.mm.bing.net/th/id/OIP.JlgTYzbbGD7bJ2p7wc38PwHaEm?r=0&cb=thfc1&rs=1&pid=ImgDetMain&o=7&rm=3`, 
        text: "Haryana" },
      { image: `https://images.unsplash.com/photo-1657894736581-ccc35d62d9e2?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`,
         text: "Himachal Pradesh" },
      { image: `https://i0.wp.com/www.tusktravel.com/blog/wp-content/uploads/2021/04/Hundru-Waterfall-Ranchi-Jharkhand.jpg?resize=800%2C531&ssl=1`, 
        text: "Jharkhand" },
      { image: `https://www.shutterstock.com/image-photo/hampi-stone-chariot-antique-art-600nw-1845146602.jpg`,
         text: "Karnataka" },
      { image: `https://media.istockphoto.com/id/1347088244/photo/kerala-most-beautiful-place-of-india.jpg?s=612x612&w=0&k=20&c=oBVJ6rUfq1YOua_4Oqhj0B1TFwcMFhniaysLJEN_eh8=`, 
        text: "Kerala" },
      { image: `https://images.unsplash.com/photo-1606298855672-3efb63017be8?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`, 
        text: "Madhya Pradesh	" },
      { image: `https://media.gettyimages.com/id/663507425/photo/the-gateway-of-india-mumbai-india.jpg?s=612x612&w=0&k=20&c=4023ICzc5XE8a9KCZ7ADF69UT9TByAeW7iXLD1JpM0M=`, 
        text: "Maharashtra" },
      { image: `https://t4.ftcdn.net/jpg/06/78/60/95/360_F_678609557_AOvkHHSHm3SSLivN4VeySY6mb5lGQGZy.jpg`, 
        text: "Manipur" },
      { image: `https://www.shutterstock.com/image-photo/green-valley-meghalaya-monsoons-600nw-2508207249.jpg`, 
        text: "Meghalaya" },
      { image: `https://media.istockphoto.com/id/174867262/photo/aizawl-india-clouds-approaching.jpg?s=612x612&w=0&k=20&c=WSNY1C0_pMEaEMMq3FojehpP_HDJVUh7tBDPvqY5uCk=`, 
        text: "Mizoram" },
      { image: `https://media.istockphoto.com/id/2090625254/photo/view-of-the-kohima-war-cemetery-in-nagaland-india.jpg?s=612x612&w=0&k=20&c=xdRTlBpdOTMTqqQIBe7L_0_5G_gtwOt7riyBcQrN1ew=`, 
        text: "Nagaland" },
      { image: `https://t4.ftcdn.net/jpg/05/04/06/93/240_F_504069398_GMcrZl2dqajtdf83owKChGNbNrFN4MKo.jpg`, 
        text: "Odisha" },
      { image: `https://media.istockphoto.com/id/119925972/photo/golden-temple-amritsar.jpg?s=612x612&w=0&k=20&c=dOlIAwyri9rkYqZh31aYIWc7Yv-j4q9-fR0ajCmX9HU=`, 
        text: "Punjab" },
      { image: `https://media.istockphoto.com/id/1253611771/photo/indian-cameleers-camel-driver-with-camel-silhouettes-in-dunes-on-sunset-jaisalmer-rajasthan.jpg?s=612x612&w=0&k=20&c=246h_uppjlN5pM_iv5kxgnFWOxKyX30H4osCJ6tASmc=`, 
        text: "Rajasthan" },
      { image: `https://media.istockphoto.com/id/1412643431/photo/aerial-view-of-a-scenic-village-with-colourful-houses.jpg?s=612x612&w=0&k=20&c=eXNmj2MbAyKi1t_EMjxTL-ZA-uvydN-0wVl_3JuxV-g=`, 
        text: "Sikkim" },
      { image: `https://media.gettyimages.com/id/520906446/photo/meenakshi-temple-madurai-tamilnadu-india.jpg?s=612x612&w=0&k=20&c=Pcq69QbgTKb1ffVIDd9vQvLlvdOp0BDx9hWPiXrzjUY=`, 
        text: "Tamil Nadu	" },
      { image: `https://images.unsplash.com/photo-1551161242-b5af797b7233?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2hhcm1pbmFyJTJDJTIwaHlkZXJhYmFkJTJDJTIwaW5kaWF8ZW58MHx8MHx8fDA%3D`, 
        text: "Telangana" },
      { image: `https://www.shutterstock.com/image-photo/green-tea-gurden-tripura-india-600nw-2453024759.jpg`, 
        text: "Tripura" },
      { image: `https://media.gettyimages.com/id/949182970/photo/noida-cityscape-at-dusk-with-the-metro-station-track-and-buildings.jpg?s=612x612&w=0&k=20&c=aTVLGIC741qzEYz7oLiswZdlSzBdo3t-EdkGDiX5kgU=`, 
        text: "Uttar Pradesh" },
      { image: `https://images.pexels.com/photos/924831/pexels-photo-924831.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500`, 
        text: "Uttarakhand" },
      { image: `https://media.istockphoto.com/id/1141737345/photo/howrah-bridge-is-a-bridge-with-a-suspended-span-over-the-hooghly-river-in-west-bengal-india.jpg?s=612x612&w=0&k=20&c=pwP9Srr2bSVZHcXYRjX8_xQza3G5d0saKql4BnAiW_k=`, 
        text: "West Bengal" },
    ];
    const galleryItems = items && items.length ? items : defaultItems;
    this.mediasImages = galleryItems.concat(galleryItems);
    this.medias = this.mediasImages.map((data, index) => {
      return new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: data.text,
        viewport: this.viewport,
        bend,
        textColor,
        borderRadius,
        font,
      });
    });
  }
  onTouchDown(e) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = e.touches ? e.touches[0].clientX : e.clientX;
  }
  onTouchMove(e) {
    if (!this.isDown) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const distance = (this.start - x) * (this.scrollSpeed * 0.025);
    this.scroll.target = this.scroll.position + distance;
  }
  onTouchUp() {
    this.isDown = false;
    this.onCheck();
  }
  onWheel(e) {
    const delta = e.deltaY || e.wheelDelta || e.detail;
    this.scroll.target += delta > 0 ? this.scrollSpeed : -this.scrollSpeed;
    this.onCheckDebounce();
  }
  onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  }
  onResize() {
  this.screen = {
    width: this.container.clientWidth,
    height: this.container.clientHeight,
  };

  this.renderer.setSize(this.screen.width, this.screen.height);

  const isMobile = this.screen.width <= 768;
  const isVerySmall = this.screen.width <= 350;

  // Step 1: Dynamically set FOV based on device
  if (isVerySmall) {
    this.camera.fov = 40;
  } else if (isMobile) {
    this.camera.fov = 25;
  } else {
    this.camera.fov = 35;
  }

  // Step 2: Update perspective and viewport
  this.camera.perspective({
    aspect: this.screen.width / this.screen.height,
  });

  const fov = (this.camera.fov * Math.PI) / 180;
  const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
  const width = height * this.camera.aspect;
  this.viewport = { width, height };

  const scaleFactor = isVerySmall ? 0.6 : isMobile ? 0.75 : 1;
  const CUSTOM_HEIGHT = isVerySmall ? 450 : isMobile ? 600 : 800;
  const CUSTOM_WIDTH = isVerySmall ? 500 : isMobile ? 650 : 700;

  this.scale = (this.screen.height / 1500) * scaleFactor;

  if (this.scene) {
    this.scene.position.y = isVerySmall ? 2.5 : isMobile ? 1.5 : 0;
  }

  if (this.medias) {
    this.medias.forEach((media) => {
      media.customSize = { width: CUSTOM_WIDTH, height: CUSTOM_HEIGHT };
      media.onResize({ screen: this.screen, viewport: this.viewport });
    });
  }
}

  update() {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    
    const direction = this.scroll.current > this.scroll.last ? "right" : "left";
    if (this.medias) {
      this.medias.forEach((media) => media.update(this.scroll, direction));
     

    }
   
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }
  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);
    window.addEventListener("resize", this.boundOnResize);
    window.addEventListener("mousewheel", this.boundOnWheel);
    window.addEventListener("wheel", this.boundOnWheel);
    window.addEventListener("mousedown", this.boundOnTouchDown);
    window.addEventListener("mousemove", this.boundOnTouchMove);
    window.addEventListener("mouseup", this.boundOnTouchUp);
    window.addEventListener("touchstart", this.boundOnTouchDown);
    window.addEventListener("touchmove", this.boundOnTouchMove);
    window.addEventListener("touchend", this.boundOnTouchUp);
  }
  destroy() {
    window.removeEventListener("click", this.boundOnClick);

    window.cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.boundOnResize);
    window.removeEventListener("mousewheel", this.boundOnWheel);
    window.removeEventListener("wheel", this.boundOnWheel);
    window.removeEventListener("mousedown", this.boundOnTouchDown);
    window.removeEventListener("mousemove", this.boundOnTouchMove);
    window.removeEventListener("mouseup", this.boundOnTouchUp);
    window.removeEventListener("touchstart", this.boundOnTouchDown);
    window.removeEventListener("touchmove", this.boundOnTouchMove);
    window.removeEventListener("touchend", this.boundOnTouchUp);
    if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
    }
  }
}

export default function CircularGallery({
 
  items,
  bend = 3,
  textColor = "#ffffff",
  borderRadius = 0.05,
  font = "bold 30px Figtree",
  scrollSpeed = 2,
  scrollEase = 0.05,
}) {
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const app = new App(containerRef.current, {
      items,
   
      bend,
      textColor,
      borderRadius,
      font,
      scrollSpeed,
      scrollEase,
      onClick: (media) => {
        // Slugify the name for the route, e.g. "Andhra Pradesh" => "andhra-pradesh"
        const slug = media.text
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "");
        // Navigate to the route, no state passed
        navigate(`/gallery/${slug}`);
       
        
      },
     
    });

    return () => {
      app.destroy();
    };
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase, navigate]);

  return (
    <div
      className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
      ref={containerRef}
    />
  );
} 