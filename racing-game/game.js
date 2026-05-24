(function () {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const hud = {
    speed: document.getElementById("speedValue"),
    lap: document.getElementById("lapValue"),
    position: document.getElementById("positionValue"),
    time: document.getElementById("timeValue"),
    status: document.getElementById("raceStatus"),
    gap: document.getElementById("leaderGap"),
  };

  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const horizon = HEIGHT * 0.34;

  const segmentLength = 220;
  const rumbleLength = 3;
  const roadWidth = 2200;
  const lanes = 3;
  const fieldOfView = 100;
  const cameraHeight = 1100;
  const cameraDepth = 1 / Math.tan((fieldOfView * Math.PI) / 360);
  const playerZ = cameraHeight * cameraDepth;
  const drawDistance = 220;
  const maxSpeed = 16000;
  const accel = 9200;
  const braking = 18000;
  const decel = 4200;
  const offRoadDecel = 8600;
  const centrifugal = 0.22;
  const lapsToWin = 3;
  const carWidth = 180;
  const competitorCount = 6;
  const visibleRoad = drawDistance * segmentLength;

  const palette = {
    skyTop: "#8fe0ff",
    skyBottom: "#eef9ff",
    haze: "rgba(240, 250, 255, 0.10)",
    mountainFar: "#3d6e79",
    mountainNear: "#274e59",
    grassLight: "#38956a",
    grassDark: "#257451",
    roadLight: "#686868",
    roadDark: "#5a5a5a",
    lane: "rgba(255, 255, 255, 0.66)",
    rumbleLight: "#fffbef",
    rumbleDark: "#d95151",
    startRoad: "#7a7a7a",
    startRumble: "#ffd166",
    startLane: "rgba(255, 255, 255, 0.95)",
    text: "#ffffff",
    shadow: "rgba(0, 0, 0, 0.24)",
  };

  const names = ["Neon", "Apex", "Pulse", "Drift", "Nova", "Comet"];
  const colors = ["#00c2ff", "#7aff7a", "#f84e8b", "#ffd34d", "#9f8cff", "#ff8f3c"];

  const input = {
    left: false,
    right: false,
    accel: false,
    brake: false,
  };

  const world = {
    segments: [],
    trackLength: 0,
  };

  const state = {
    playerX: 0,
    playerSpeed: 0,
    playerDistance: 0,
    competitors: [],
    countdown: 3.6,
    raceTime: 0,
    finished: false,
    finishPlace: null,
    lastTimestamp: 0,
    impactTimer: 0,
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function wrap(value, max) {
    return ((value % max) + max) % max;
  }

  function lerp(a, b, percent) {
    return a + (b - a) * percent;
  }

  function easeInOut(percent) {
    return percent < 0.5
      ? 2 * percent * percent
      : -1 + (4 - 2 * percent) * percent;
  }

  function percentRemaining(z, length) {
    return wrap(z, length) / length;
  }

  function ordinal(value) {
    const tail = value % 10;
    const teens = value % 100;
    if (tail === 1 && teens !== 11) {
      return `${value}st`;
    }
    if (tail === 2 && teens !== 12) {
      return `${value}nd`;
    }
    if (tail === 3 && teens !== 13) {
      return `${value}rd`;
    }
    return `${value}th`;
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    const tenths = Math.floor((seconds % 1) * 10);
    return `${minutes}:${secs}.${tenths}`;
  }

  function project(point, cameraX, cameraY, cameraZ, worldZ) {
    const depth = worldZ - cameraZ;
    point.camera.x = point.world.x - cameraX;
    point.camera.y = point.world.y - cameraY;
    point.camera.z = depth;
    point.screen.scale = cameraDepth / depth;
    point.screen.x = Math.round(
      WIDTH / 2 + point.screen.scale * point.camera.x * (WIDTH / 2)
    );
    point.screen.y = Math.round(
      HEIGHT / 2 - point.screen.scale * point.camera.y * (HEIGHT / 2)
    );
    point.screen.w = Math.round(point.screen.scale * roadWidth * (WIDTH / 2));
  }

  function polygon(points, fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) {
      ctx.lineTo(points[i], points[i + 1]);
    }
    ctx.closePath();
    ctx.fill();
  }

  function pushSegment(curve, nextY) {
    const index = world.segments.length;
    const previousY = index === 0 ? 0 : world.segments[index - 1].p2.world.y;

    world.segments.push({
      index,
      curve,
      sprites: [],
      p1: {
        world: { x: 0, y: previousY, z: index * segmentLength },
        camera: {},
        screen: {},
      },
      p2: {
        world: { x: 0, y: nextY, z: (index + 1) * segmentLength },
        camera: {},
        screen: {},
      },
    });
  }

  function addStraight(count) {
    const baseY =
      world.segments.length === 0
        ? 0
        : world.segments[world.segments.length - 1].p2.world.y;

    for (let i = 0; i < count; i += 1) {
      pushSegment(0, baseY);
    }
  }

  function addRoad(enter, hold, leave, curve, hill) {
    const total = enter + hold + leave;
    const startY =
      world.segments.length === 0
        ? 0
        : world.segments[world.segments.length - 1].p2.world.y;
    const endY = startY + hill * segmentLength;

    for (let n = 0; n < total; n += 1) {
      const section =
        n < enter
          ? lerp(0, curve, n / Math.max(1, enter))
          : n < enter + hold
            ? curve
            : lerp(curve, 0, (n - enter - hold) / Math.max(1, leave));
      const progress = easeInOut((n + 1) / total);
      pushSegment(section, lerp(startY, endY, progress));
    }
  }

  function buildTrack() {
    world.segments = [];

    addStraight(45);
    addRoad(24, 30, 24, 0.95, 7);
    addRoad(18, 36, 18, -1.15, -10);
    addRoad(14, 24, 14, 0.45, 15);
    addStraight(36);
    addRoad(20, 32, 20, 1.35, 0);
    addRoad(24, 28, 24, -0.85, 9);
    addRoad(16, 28, 16, 0, -16);
    addStraight(32);
    addRoad(20, 34, 20, -1.25, 4);
    addRoad(14, 24, 14, 0.75, 14);
    addRoad(18, 24, 18, 1.05, -8);
    addStraight(40);

    world.trackLength = world.segments.length * segmentLength;

    for (let i = 0; i < world.segments.length; i += 1) {
      const segment = world.segments[i];

      if (i % 9 === 0) {
        segment.sprites.push({
          kind: "tree",
          offset: i % 18 === 0 ? -1.5 : 1.55,
          size: 1 + ((i / 9) % 3) * 0.12,
        });
      }

      if (i % 17 === 4) {
        segment.sprites.push({
          kind: "billboard",
          offset: i % 34 === 4 ? -1.95 : 1.95,
          size: 1,
          text: i % 34 === 4 ? "BOOST" : "DRIFT",
        });
      }

      if (i % 13 === 2) {
        segment.sprites.push({
          kind: "cone",
          offset: i % 26 === 2 ? -1.12 : 1.12,
          size: 1,
        });
      }
    }
  }

  function createCompetitors() {
    state.competitors = [];

    for (let i = 0; i < competitorCount; i += 1) {
      state.competitors.push({
        id: i,
        name: names[i],
        color: colors[i],
        distance: 120 - i * 52,
        speed: maxSpeed * (0.68 + i * 0.025),
        speedFactor: 0.8 + i * 0.02,
        offset: i % 2 === 0 ? -0.44 - i * 0.05 : 0.35 + i * 0.04,
        targetOffset: 0,
        decisionCooldown: 0.2 + i * 0.08,
      });
    }
  }

  function restartRace() {
    state.playerX = 0;
    state.playerSpeed = 0;
    state.playerDistance = 0;
    state.countdown = 3.6;
    state.raceTime = 0;
    state.finished = false;
    state.finishPlace = null;
    state.impactTimer = 0;
    createCompetitors();
  }

  function findSegment(z) {
    return world.segments[Math.floor(wrap(z, world.trackLength) / segmentLength)];
  }

  function getPlayerLap() {
    if (state.finished) {
      return lapsToWin;
    }
    return clamp(Math.floor(state.playerDistance / world.trackLength) + 1, 1, lapsToWin);
  }

  function getStandings() {
    const racers = [
      {
        id: "player",
        name: "You",
        distance: state.playerDistance,
      },
      ...state.competitors.map((car) => ({
        id: car.id,
        name: car.name,
        distance: car.distance,
      })),
    ];

    racers.sort((a, b) => b.distance - a.distance);

    return {
      order: racers,
      playerPosition: racers.findIndex((entry) => entry.id === "player") + 1,
    };
  }

  function updateCompetitors(dt) {
    for (const car of state.competitors) {
      car.decisionCooldown -= dt;

      const segment = findSegment(car.distance);
      const curveInfluence = clamp(-segment.curve * 0.25, -0.6, 0.6);
      let targetOffset = curveInfluence;
      let trafficPenalty = 0;

      for (const other of state.competitors) {
        if (other === car) {
          continue;
        }

        const gap = other.distance - car.distance;
        if (gap > 0 && gap < 950 && Math.abs(other.offset - car.offset) < 0.34) {
          targetOffset = other.offset > car.offset ? car.offset - 0.55 : car.offset + 0.55;
          trafficPenalty = 1800;
          break;
        }
      }

      const playerGap = state.playerDistance - car.distance;
      if (
        playerGap > 0 &&
        playerGap < 850 &&
        Math.abs(state.playerX - car.offset) < 0.32
      ) {
        targetOffset = state.playerX > car.offset ? car.offset - 0.48 : car.offset + 0.48;
        trafficPenalty = 2200;
      }

      if (car.decisionCooldown <= 0) {
        car.targetOffset = clamp(
          targetOffset + Math.sin((car.distance + car.id * 130) * 0.003) * 0.18,
          -1.05,
          1.05
        );
        car.decisionCooldown = 0.35 + (car.id % 3) * 0.18;
      }

      car.offset = lerp(car.offset, car.targetOffset, dt * (1.8 + car.id * 0.08));

      const desiredSpeed = clamp(
        maxSpeed * car.speedFactor - Math.abs(segment.curve) * 1600 - trafficPenalty,
        maxSpeed * 0.58,
        maxSpeed * 0.95
      );

      if (car.speed < desiredSpeed) {
        car.speed = Math.min(desiredSpeed, car.speed + dt * 3600);
      } else {
        car.speed = Math.max(desiredSpeed, car.speed - dt * 5200);
      }

      car.distance += car.speed * dt;
    }
  }

  function handleCollisions() {
    for (const car of state.competitors) {
      const gap = car.distance - state.playerDistance;
      if (gap < -120 || gap > 220) {
        continue;
      }

      if (Math.abs(car.offset - state.playerX) < 0.24) {
        state.playerSpeed = Math.min(state.playerSpeed * 0.52, car.speed * 0.92);
        state.playerX += state.playerX < car.offset ? -0.2 : 0.2;
        state.impactTimer = 0.22;
      }
    }
  }

  function update(dt) {
    dt = Math.min(dt, 0.05);

    if (!state.finished) {
      state.raceTime += dt;
    }

    if (state.countdown > 0) {
      state.countdown = Math.max(0, state.countdown - dt);
    }

    if (state.impactTimer > 0) {
      state.impactTimer = Math.max(0, state.impactTimer - dt);
    }

    const canDrive = state.countdown <= 0 && !state.finished;
    const currentSegment = findSegment(state.playerDistance);
    const speedPercent = state.playerSpeed / maxSpeed;
    const steerPower = 2.35 * speedPercent;

    if (canDrive && input.accel) {
      state.playerSpeed = Math.min(maxSpeed, state.playerSpeed + accel * dt);
    } else if (canDrive && input.brake) {
      state.playerSpeed = Math.max(0, state.playerSpeed - braking * dt);
    } else {
      state.playerSpeed = Math.max(0, state.playerSpeed - decel * dt);
    }

    if (canDrive) {
      if (input.left) {
        state.playerX -= steerPower * dt;
      }
      if (input.right) {
        state.playerX += steerPower * dt;
      }
    }

    state.playerX -= currentSegment.curve * centrifugal * speedPercent * dt;

    if (Math.abs(state.playerX) > 1.1 && state.playerSpeed > maxSpeed * 0.35) {
      state.playerSpeed = Math.max(0, state.playerSpeed - offRoadDecel * dt);
    }

    state.playerX = clamp(state.playerX, -1.8, 1.8);
    state.playerDistance += state.playerSpeed * dt;

    updateCompetitors(dt);

    if (canDrive) {
      handleCollisions();
    }

    if (!state.finished && state.playerDistance >= world.trackLength * lapsToWin) {
      const standings = getStandings();
      state.finished = true;
      state.finishPlace = standings.playerPosition;
      state.playerSpeed *= 0.5;
    }
  }

  function renderBackground(playerSegment) {
    const sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, palette.skyTop);
    sky.addColorStop(1, palette.skyBottom);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, WIDTH, horizon);

    ctx.fillStyle = palette.haze;
    ctx.fillRect(0, horizon - 18, WIDTH, 42);

    const sunX = WIDTH * 0.78 - playerSegment.curve * 120;
    const sunY = horizon * 0.32;
    const glow = ctx.createRadialGradient(sunX, sunY, 12, sunX, sunY, 78);
    glow.addColorStop(0, "rgba(255, 238, 170, 1)");
    glow.addColorStop(0.45, "rgba(255, 184, 92, 0.92)");
    glow.addColorStop(1, "rgba(255, 184, 92, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 78, 0, Math.PI * 2);
    ctx.fill();

    drawMountainBand(palette.mountainFar, horizon + 28, 46, 0.0008, playerSegment.curve * 32);
    drawMountainBand(palette.mountainNear, horizon + 54, 72, 0.0015, playerSegment.curve * 58);

    ctx.fillStyle = "#b3ddc8";
    ctx.fillRect(0, horizon + 38, WIDTH, HEIGHT - horizon);
  }

  function drawMountainBand(color, baseY, amplitude, frequency, shift) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, HEIGHT);

    for (let x = 0; x <= WIDTH + 8; x += 8) {
      const y =
        baseY -
        Math.sin((x + shift) * frequency) * amplitude -
        Math.sin((x + shift) * frequency * 0.43) * amplitude * 0.42;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(WIDTH, HEIGHT);
    ctx.closePath();
    ctx.fill();
  }

  function renderSegment(segment) {
    const p1 = segment.p1.screen;
    const p2 = segment.p2.screen;

    const special = segment.index < 6;
    const grass = Math.floor(segment.index / rumbleLength) % 2 === 0
      ? palette.grassLight
      : palette.grassDark;
    const road = special ? palette.startRoad : segment.index % 2 === 0 ? palette.roadLight : palette.roadDark;
    const rumble = special
      ? palette.startRumble
      : Math.floor(segment.index / rumbleLength) % 2 === 0
        ? palette.rumbleLight
        : palette.rumbleDark;
    const laneColor = special ? palette.startLane : palette.lane;
    const rumble1 = p1.w / 5.5;
    const rumble2 = p2.w / 5.5;

    ctx.fillStyle = grass;
    ctx.fillRect(0, p2.y, WIDTH, p1.y - p2.y);

    polygon(
      [
        p1.x - p1.w - rumble1,
        p1.y,
        p1.x - p1.w,
        p1.y,
        p2.x - p2.w,
        p2.y,
        p2.x - p2.w - rumble2,
        p2.y,
      ],
      rumble
    );

    polygon(
      [
        p1.x + p1.w + rumble1,
        p1.y,
        p1.x + p1.w,
        p1.y,
        p2.x + p2.w,
        p2.y,
        p2.x + p2.w + rumble2,
        p2.y,
      ],
      rumble
    );

    polygon(
      [
        p1.x - p1.w,
        p1.y,
        p1.x + p1.w,
        p1.y,
        p2.x + p2.w,
        p2.y,
        p2.x - p2.w,
        p2.y,
      ],
      road
    );

    const laneWidth1 = (p1.w * 2) / lanes;
    const laneWidth2 = (p2.w * 2) / lanes;
    const markerWidth1 = Math.max(2, p1.w / 32);
    const markerWidth2 = Math.max(2, p2.w / 32);

    for (let lane = 1; lane < lanes; lane += 1) {
      const laneX1 = p1.x - p1.w + laneWidth1 * lane;
      const laneX2 = p2.x - p2.w + laneWidth2 * lane;
      polygon(
        [
          laneX1 - markerWidth1 / 2,
          p1.y,
          laneX1 + markerWidth1 / 2,
          p1.y,
          laneX2 + markerWidth2 / 2,
          p2.y,
          laneX2 - markerWidth2 / 2,
          p2.y,
        ],
        laneColor
      );
    }
  }

  function renderRoadside(segment) {
    const baseX = segment.p2.screen.x;
    const baseY = segment.p2.screen.y;
    const scale = segment.p2.screen.scale;

    for (const sprite of segment.sprites) {
      const spriteX = baseX + scale * sprite.offset * roadWidth * (WIDTH / 2);

      if (sprite.kind === "tree") {
        drawTree(spriteX, baseY, scale * sprite.size);
      } else if (sprite.kind === "billboard") {
        drawBillboard(spriteX, baseY, scale * sprite.size, sprite.text);
      } else if (sprite.kind === "cone") {
        drawCone(spriteX, baseY, scale * sprite.size);
      }
    }
  }

  function drawTree(x, y, scale) {
    const width = 140 * scale;
    const height = 260 * scale;

    if (width < 2 || x < -150 || x > WIDTH + 150) {
      return;
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    ctx.beginPath();
    ctx.ellipse(x, y + 4, width * 0.6, height * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#6f4c2e";
    ctx.fillRect(x - width * 0.09, y - height * 0.28, width * 0.18, height * 0.28);

    ctx.fillStyle = "#1f7f52";
    ctx.beginPath();
    ctx.moveTo(x, y - height);
    ctx.lineTo(x - width * 0.56, y - height * 0.3);
    ctx.lineTo(x + width * 0.56, y - height * 0.3);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x, y - height * 0.82);
    ctx.lineTo(x - width * 0.72, y - height * 0.48);
    ctx.lineTo(x + width * 0.72, y - height * 0.48);
    ctx.closePath();
    ctx.fill();
  }

  function drawBillboard(x, y, scale, text) {
    const width = 220 * scale;
    const height = 140 * scale;

    if (width < 2 || x < -200 || x > WIDTH + 200) {
      return;
    }

    ctx.fillStyle = "#5a4127";
    ctx.fillRect(x - width * 0.06, y - height * 0.1, width * 0.12, height * 0.42);

    ctx.fillStyle = "#fff7e3";
    ctx.fillRect(x - width / 2, y - height, width, height * 0.7);

    ctx.strokeStyle = "#ff8f3c";
    ctx.lineWidth = Math.max(1, 6 * scale);
    ctx.strokeRect(x - width / 2, y - height, width, height * 0.7);

    ctx.fillStyle = "#183345";
    ctx.font = `${Math.max(10, 42 * scale)}px Arial Black`;
    ctx.textAlign = "center";
    ctx.fillText(text, x, y - height * 0.52);
  }

  function drawCone(x, y, scale) {
    const width = 60 * scale;
    const height = 85 * scale;

    if (width < 1.5 || x < -120 || x > WIDTH + 120) {
      return;
    }

    ctx.fillStyle = "#ff8f3c";
    polygon(
      [
        x,
        y - height,
        x - width / 2,
        y,
        x + width / 2,
        y,
      ],
      "#ff8f3c"
    );

    ctx.fillStyle = "#fff7e3";
    ctx.fillRect(x - width * 0.32, y - height * 0.45, width * 0.64, height * 0.12);
    ctx.fillRect(x - width * 0.4, y - height * 0.18, width * 0.8, height * 0.12);
  }

  function drawCarBody(x, y, width, height, color, label, isPlayer) {
    if (width < 5 || x < -200 || x > WIDTH + 200) {
      return;
    }

    const wheelWidth = width * 0.18;
    const wheelHeight = height * 0.2;
    const shadowWidth = width * 0.72;
    const glowColor = isPlayer ? "rgba(255, 240, 180, 0.36)" : "rgba(255, 255, 255, 0.12)";

    ctx.fillStyle = palette.shadow;
    ctx.beginPath();
    ctx.ellipse(x, y + height * 0.05, shadowWidth, height * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isPlayer) {
      const glow = ctx.createRadialGradient(x, y - height * 0.2, 2, x, y - height * 0.2, width);
      glow.addColorStop(0, glowColor);
      glow.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.ellipse(x, y - height * 0.2, width * 0.94, height * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#181818";
    ctx.fillRect(x - width * 0.42, y - height * 0.22, wheelWidth, wheelHeight);
    ctx.fillRect(x + width * 0.24, y - height * 0.22, wheelWidth, wheelHeight);
    ctx.fillRect(x - width * 0.42, y - height * 0.78, wheelWidth, wheelHeight);
    ctx.fillRect(x + width * 0.24, y - height * 0.78, wheelWidth, wheelHeight);

    polygon(
      [
        x,
        y - height,
        x - width * 0.48,
        y - height * 0.58,
        x - width * 0.34,
        y,
        x + width * 0.34,
        y,
        x + width * 0.48,
        y - height * 0.58,
      ],
      color
    );

    polygon(
      [
        x,
        y - height * 0.88,
        x - width * 0.24,
        y - height * 0.52,
        x + width * 0.24,
        y - height * 0.52,
      ],
      "#d9f3ff"
    );

    ctx.strokeStyle = "rgba(255, 255, 255, 0.34)";
    ctx.lineWidth = Math.max(1, width * 0.018);
    ctx.beginPath();
    ctx.moveTo(x - width * 0.24, y - height * 0.52);
    ctx.lineTo(x - width * 0.34, y - height * 0.08);
    ctx.moveTo(x + width * 0.24, y - height * 0.52);
    ctx.lineTo(x + width * 0.34, y - height * 0.08);
    ctx.stroke();

    ctx.fillStyle = "#fff4dc";
    ctx.fillRect(x - width * 0.26, y - height * 0.12, width * 0.1, height * 0.08);
    ctx.fillRect(x + width * 0.16, y - height * 0.12, width * 0.1, height * 0.08);

    ctx.fillStyle = isPlayer ? "#fff8df" : "rgba(255, 255, 255, 0.86)";
    ctx.font = `${Math.max(8, width * 0.12)}px Arial Black`;
    ctx.textAlign = "center";
    ctx.fillText(label, x, y - height * 0.33);
  }

  function buildCarsBySegment(cameraDistance) {
    const carsBySegment = new Map();

    for (const car of state.competitors) {
      const delta = car.distance - cameraDistance;
      if (delta <= 0 || delta >= visibleRoad) {
        continue;
      }

      const segmentIndex = findSegment(car.distance).index;
      if (!carsBySegment.has(segmentIndex)) {
        carsBySegment.set(segmentIndex, []);
      }
      carsBySegment.get(segmentIndex).push(car);
    }

    return carsBySegment;
  }

  function renderCarsOnSegment(segment, cars) {
    if (!cars || cars.length === 0) {
      return;
    }

    cars.sort((a, b) => b.distance - a.distance);

    for (const car of cars) {
      const percent = percentRemaining(car.distance, segmentLength);
      const scale = lerp(segment.p1.screen.scale, segment.p2.screen.scale, percent);
      const carX =
        lerp(segment.p1.screen.x, segment.p2.screen.x, percent) +
        scale * car.offset * roadWidth * (WIDTH / 2);
      const carY = lerp(segment.p1.screen.y, segment.p2.screen.y, percent);
      const width = scale * carWidth * (WIDTH / 2);
      const height = width * 0.72;
      drawCarBody(carX, carY, width, height, car.color, car.name, false);
    }
  }

  function renderPlayerCar() {
    const shake = state.impactTimer > 0 ? Math.sin(state.raceTime * 80) * 12 : 0;
    const bob = Math.sin(state.raceTime * 14 + state.playerSpeed * 0.002) * 2;
    const x = WIDTH * 0.5 + state.playerX * 170 + shake;
    const y = HEIGHT * 0.88 + bob;
    drawCarBody(x, y, 164, 116, "#ff5440", "YOU", true);
  }

  function updateHud() {
    const standings = getStandings();
    const lap = getPlayerLap();
    const leader = standings.order[0];
    const ahead =
      standings.playerPosition > 1 ? standings.order[standings.playerPosition - 2] : null;

    hud.speed.textContent = `${Math.round(state.playerSpeed * 0.02)} km/h`;
    hud.lap.textContent = `${lap} / ${lapsToWin}`;
    hud.position.textContent = `${standings.playerPosition} / ${competitorCount + 1}`;
    hud.time.textContent = formatTime(state.raceTime);

    if (state.finished) {
      hud.status.textContent = `${ordinal(state.finishPlace)} place finish`;
      hud.gap.textContent = "Press R to jump back onto the grid.";
      return;
    }

    if (state.countdown > 0) {
      hud.status.textContent = "Countdown";
      hud.gap.textContent = "Hold the line and launch when the lights go green.";
      return;
    }

    hud.status.textContent = `Lap ${lap} / ${lapsToWin}`;
    hud.gap.textContent =
      standings.playerPosition === 1
        ? `Leading ${leader.id === "player" ? standings.order[1].name : leader.name}.`
        : `Chasing ${ahead ? ahead.name : leader.name}.`;
  }

  function renderOverlay() {
    ctx.textAlign = "center";

    if (state.countdown > 0) {
      const text = state.countdown < 0.8 ? "GO!" : `${Math.ceil(state.countdown)}`;
      ctx.fillStyle = "rgba(8, 19, 26, 0.34)";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = palette.text;
      ctx.font = "96px Arial Black";
      ctx.fillText(text, WIDTH / 2, HEIGHT * 0.48);
      ctx.font = "24px Trebuchet MS";
      ctx.fillText("Beat the pack across three laps.", WIDTH / 2, HEIGHT * 0.56);
    }

    if (state.finished) {
      ctx.fillStyle = "rgba(8, 19, 26, 0.36)";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = palette.text;
      ctx.font = "72px Arial Black";
      ctx.fillText(`${ordinal(state.finishPlace)} Place`, WIDTH / 2, HEIGHT * 0.42);
      ctx.font = "28px Trebuchet MS";
      ctx.fillText("Press R to race again.", WIDTH / 2, HEIGHT * 0.52);
      ctx.fillText(`Final time ${formatTime(state.raceTime)}`, WIDTH / 2, HEIGHT * 0.58);
    }
  }

  function render() {
    const cameraDistance = state.playerDistance - playerZ;
    const cameraTrack = wrap(cameraDistance, world.trackLength);
    const baseSegment = findSegment(cameraTrack);
    const playerSegment = findSegment(state.playerDistance);
    const playerPercent = percentRemaining(state.playerDistance, segmentLength);
    const playerY =
      lerp(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent) + cameraHeight;

    renderBackground(playerSegment);

    let x = 0;
    let dx = -baseSegment.curve * percentRemaining(cameraTrack, segmentLength);
    let maxY = HEIGHT;
    const visibleSegments = [];
    const carsBySegment = buildCarsBySegment(cameraDistance);

    for (let n = 0; n < drawDistance; n += 1) {
      const segment = world.segments[(baseSegment.index + n) % world.segments.length];
      const looped = segment.index < baseSegment.index;
      const z1 = segment.p1.world.z + (looped ? world.trackLength : 0);
      const z2 = segment.p2.world.z + (looped ? world.trackLength : 0);

      project(segment.p1, state.playerX * roadWidth - x, playerY, cameraTrack, z1);
      project(segment.p2, state.playerX * roadWidth - x - dx, playerY, cameraTrack, z2);

      x += dx;
      dx += segment.curve;

      if (
        segment.p1.camera.z <= cameraDepth ||
        segment.p2.screen.y >= segment.p1.screen.y ||
        segment.p2.screen.y >= maxY
      ) {
        continue;
      }

      maxY = segment.p2.screen.y;
      visibleSegments.push(segment);
    }

    for (let i = visibleSegments.length - 1; i >= 0; i -= 1) {
      renderSegment(visibleSegments[i]);
      renderRoadside(visibleSegments[i]);
      renderCarsOnSegment(
        visibleSegments[i],
        carsBySegment.get(visibleSegments[i].index) || []
      );
    }

    renderPlayerCar();
    renderOverlay();
    updateHud();
  }

  function loop(timestamp) {
    if (!state.lastTimestamp) {
      state.lastTimestamp = timestamp;
    }

    const dt = (timestamp - state.lastTimestamp) / 1000;
    state.lastTimestamp = timestamp;

    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  function setKeyState(code, pressed) {
    if (code === "ArrowLeft" || code === "KeyA") {
      input.left = pressed;
    } else if (code === "ArrowRight" || code === "KeyD") {
      input.right = pressed;
    } else if (code === "ArrowUp" || code === "KeyW") {
      input.accel = pressed;
    } else if (code === "ArrowDown" || code === "KeyS") {
      input.brake = pressed;
    }
  }

  window.addEventListener("keydown", (event) => {
    setKeyState(event.code, true);

    if (event.code === "KeyR" && state.finished) {
      restartRace();
    }

    if (
      event.code === "ArrowLeft" ||
      event.code === "ArrowRight" ||
      event.code === "ArrowUp" ||
      event.code === "ArrowDown" ||
      event.code === "KeyA" ||
      event.code === "KeyD" ||
      event.code === "KeyW" ||
      event.code === "KeyS"
    ) {
      event.preventDefault();
    }
  });

  window.addEventListener("keyup", (event) => {
    setKeyState(event.code, false);
  });

  buildTrack();
  restartRace();
  requestAnimationFrame(loop);
})();
