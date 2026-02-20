import { createAssetService ,getMyAssetsService,getPublicAssetsService} from "../services/assetService.js";

export const createAsset = async (req, res) => {
  try {
    const asset = await createAssetService(
      req.file,
      req.body,
      req.user._id
    );

    res.status(201).json(asset);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getPublicAssets = async (req, res) => {
  try {
    const data = await getPublicAssetsService(req.query);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const getMyAssets = async (req, res) => {
  try {
    const data = await getMyAssetsService(req.user._id, req.query);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};