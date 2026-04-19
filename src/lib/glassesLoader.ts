export interface LoadedGlassesModel {
  url: string;
}

export async function loadGlassesModel(url: string): Promise<LoadedGlassesModel> {
  return { url };
}
