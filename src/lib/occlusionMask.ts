import * as THREE from 'three';

export function createOcclusionMask(): THREE.Mesh {
  // Tạo một hình trụ (Cylinder) hoặc hình Elip để mô phỏng form đầu cơ bản
  // Kích thước này sẽ được scale đồng bộ với kính khi updateTransform
  const headGeometry = new THREE.CylinderGeometry(0.14, 0.12, 0.3, 32);
  
  // ★ QUAN TRỌNG: Material Tàng Hình
  const occlusionMaterial = new THREE.MeshBasicMaterial({
    colorWrite: false, // KHÔNG vẽ màu ra màn hình (trong suốt hoàn toàn)
    depthWrite: true,  // CÓ ghi vào Depth Buffer (để che khuất vật thể khác)
  });

  const maskMesh = new THREE.Mesh(headGeometry, occlusionMaterial);
  
  // Render Order: Bắt buộc render cái đầu tàng hình này TRƯỚC khi render kính
  maskMesh.renderOrder = -1;
  
  // Dịch tâm cái đầu lùi ra sau sống mũi một chút để không che mất mắt kính phía trước
  maskMesh.position.z = -0.08; 
  maskMesh.position.y = 0.05;

  return maskMesh;
}