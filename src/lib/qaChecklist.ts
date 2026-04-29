import * as THREE from 'three';
import { GLASSES_CAPTURE_HISTORY_KEY } from '@/lib/screenshotCapture';
import { isDracoConfigured } from '@/lib/glassesLoader';

interface RunQAChecklistParams {
  renderer: THREE.WebGLRenderer | null;
  scene: THREE.Scene | null;
  occlusionMesh: THREE.Mesh | null;
  glassesModel: THREE.Object3D | null;
}

interface QACheckResult {
  label: string;
  passed: boolean;
  details?: string;
}

export function runQAChecklist({
  renderer,
  scene,
  occlusionMesh,
  glassesModel,
}: RunQAChecklistParams): QACheckResult[] {
  const modelMeshes: THREE.Mesh[] = [];

  glassesModel?.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      modelMeshes.push(child as THREE.Mesh);
    }
  });

  const results: QACheckResult[] = [
    {
      label: 'preserveDrawingBuffer = true',
      passed: renderer?.getContextAttributes()?.preserveDrawingBuffer === true,
    },
    {
      label: 'occlusionMesh có trong scene',
      passed: Boolean(scene && occlusionMesh && scene.children.includes(occlusionMesh)),
    },
    {
      label: 'glassesModel.renderOrder = 0',
      passed: Boolean(glassesModel && modelMeshes.length > 0 && modelMeshes.every((mesh) => mesh.renderOrder === 0)),
    },
    {
      label: 'occlusionMesh.renderOrder = -1',
      passed: occlusionMesh?.renderOrder === -1,
    },
    {
      label: 'DRACOLoader đã được set',
      passed: isDracoConfigured(),
    },
    {
      label: 'captureHistory persist trong localStorage',
      passed: typeof window !== 'undefined' && window.localStorage.getItem(GLASSES_CAPTURE_HISTORY_KEY) !== null,
    },
  ];

  console.groupCollapsed('[QA] Glasses Try-On checklist');
  results.forEach((result) => {
    const symbol = result.passed ? '✓' : '✗';
    const logger = result.passed ? console.log : console.warn;
    logger(`${symbol} ${result.label}${result.details ? ` - ${result.details}` : ''}`);
  });
  console.groupEnd();

  return results;
}