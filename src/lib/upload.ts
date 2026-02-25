import { supabase } from "@/integrations/supabase/client";

export const uploadProductImage = async (file: File) => {
  try {
    // Creamos un nombre de archivo único con la fecha para que no se repitan
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
    const filePath = fileName; 

    // Subimos el archivo al bucket
    const { error: uploadError, data } = await supabase.storage
      .from('product-images') // Debe coincidir con el nombre en tu captura
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    // Obtenemos la URL pública
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    return null;
  }
};

