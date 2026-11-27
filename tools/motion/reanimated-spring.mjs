/**
 * Reanimated 4.7.1 `withSpring` solver, transcribed from
 * `apps/gallery/node_modules/react-native-reanimated/lib/module/animation/spring/spring.js`
 * and `springUtils.js` so it can be compared with Compose off-device.
 *
 * This is a verification harness, not a shipped animation. The shipped path is
 * the Compose-exact solver in `useSpring`.
 */

const DEFAULT_CONFIG = {
  mass: 1,
  energyThreshold: 6e-9,
  overshootClamping: false,
  velocity: 0,
};

function initialCalculations(stiffness, config) {
  const damping = config.damping;
  const mass = config.mass;
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const omega0 = Math.sqrt(stiffness / mass);
  const omega1 = zeta < 1 ? omega0 * Math.sqrt(1 - zeta ** 2) : 0;
  return { zeta, omega0, omega1 };
}

function getEnergy(displacement, velocity, stiffness, mass) {
  return 0.5 * stiffness * displacement ** 2 + 0.5 * mass * velocity ** 2;
}

function underDamped(animation, values) {
  const { toValue } = animation;
  const { zeta, t, omega0, omega1, x0, v0 } = values;
  const sin1 = Math.sin(omega1 * t);
  const cos1 = Math.cos(omega1 * t);
  const envelope = Math.exp(-zeta * omega0 * t);
  const frag = envelope * (sin1 * ((v0 + zeta * omega0 * x0) / omega1) + x0 * cos1);
  return {
    position: toValue + frag,
    velocity:
      -zeta * omega0 * frag +
      envelope * (cos1 * (v0 + zeta * omega0 * x0) - omega1 * x0 * sin1),
  };
}

function criticallyDamped(animation, values) {
  const { toValue } = animation;
  const { v0, x0, omega0, t } = values;
  const envelope = Math.exp(-omega0 * t);
  return {
    position: toValue + envelope * (x0 + (v0 + omega0 * x0) * t),
    velocity:
      envelope * -omega0 * (x0 + (v0 + omega0 * x0) * t) +
      envelope * (v0 + omega0 * x0),
  };
}

/**
 * Run Reanimated's `withSpring` frame loop from `from` to `to`.
 * Returns every frame state plus the total simulated time.
 */
export function reanimatedSpringTrace({
  from,
  to,
  stiffness,
  dampingRatio,
  frameMs = 1000 / 60,
  maxMs = 10_000,
}) {
  const damping = 2 * dampingRatio * Math.sqrt(stiffness);
  const config = { ...DEFAULT_CONFIG, mass: 1 };
  const animation = {
    current: to,
    toValue: to,
    velocity: config.velocity,
    lastTimestamp: 0,
    startTimestamp: 0,
    zeta: 0,
    omega0: 0,
    omega1: 0,
    initialEnergy: 0,
  };
  const initial = initialCalculations(stiffness, { ...config, damping });
  animation.zeta = initial.zeta;
  animation.omega0 = initial.omega0;
  animation.omega1 = initial.omega1;
  animation.current = from;
  animation.startValue = from - to;
  animation.initialEnergy = getEnergy(from - to, animation.velocity, stiffness, config.mass);
  animation.lastTimestamp = 0;
  animation.startTimestamp = 0;

  const frames = [{ t: 0, value: from, velocity: animation.velocity, done: false }];
  let now = 0;
  while (now < maxMs) {
    now += frameMs;
    const deltaTime = Math.min(Math.max(now - animation.lastTimestamp, 0), 64);
    animation.lastTimestamp = now;
    const t = deltaTime / 1000;
    const v0 = animation.velocity;
    const x0 = animation.current - to;
    const next =
      animation.zeta < 1
        ? underDamped(animation, {
            zeta: animation.zeta,
            v0,
            x0,
            omega0: animation.omega0,
            omega1: animation.omega1,
            t,
          })
        : criticallyDamped(animation, {
            v0,
            x0,
            omega0: animation.omega0,
            t,
          });
    animation.current = next.position;
    animation.velocity = next.velocity;
    const energy = getEnergy(to - animation.current, animation.velocity, stiffness, config.mass);
    const done =
      animation.initialEnergy === 0 || energy / animation.initialEnergy <= config.energyThreshold;
    if (done) {
      animation.current = to;
      animation.velocity = 0;
    }
    frames.push({ t: now, value: animation.current, velocity: animation.velocity, done });
    if (done) break;
  }
  return { frames, zeta: initial.zeta, stiffness, damping };
}
