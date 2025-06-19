import { VulnerabilityModel } from '../model';
import * as tf from '@tensorflow/tfjs-node';
import { Cache } from '../../cache';

jest.mock('@tensorflow/tfjs-node', () => ({
  loadLayersModel: jest.fn(),
  tensor: jest.fn(),
}));

describe('VulnerabilityModel', () => {
    const mockConfig = {
        modelUrl: 'https://example.com/model.json',
        cachePath: '/tmp/model-cache',
        embeddingDim: 128
    };

    let model: VulnerabilityModel;

    beforeEach(() => {
        jest.clearAllMocks();
        model = new VulnerabilityModel(mockConfig);
    });

    it('should initialize with config', () => {
        expect(model).toBeDefined();
        expect(model['config']).toEqual(mockConfig);
    });

    it('should load model from cache if available', async () => {
        const mockCache = new Cache({
            ttl: 24 * 60 * 60 * 1000,
            cacheDir: mockConfig.cachePath
        });

        const mockModel = {
            predict: jest.fn().mockReturnValue({
                arraySync: jest.fn().mockReturnValue([[0.8, 0.2]])
            })
        };

        jest.spyOn(mockCache, 'get').mockResolvedValue({
            timestamp: Date.now(),
            data: mockModel
        });

        jest.spyOn(tf, 'loadLayersModel').mockResolvedValue(mockModel);

        const loadedModel = await model.load();
        
        expect(loadedModel).toBeDefined();
        expect(tf.loadLayersModel).not.toHaveBeenCalled();
    });

    it('should load model from URL if not in cache', async () => {
        const mockModel = {
            predict: jest.fn().mockReturnValue({
                arraySync: jest.fn().mockReturnValue([[0.8, 0.2]])
            })
        };

        jest.spyOn(tf, 'loadLayersModel').mockResolvedValue(mockModel);

        const loadedModel = await model.load();
        
        expect(loadedModel).toBeDefined();
        expect(tf.loadLayersModel).toHaveBeenCalledWith(mockConfig.modelUrl);
    });

    it('should make predictions on input code', async () => {
        const mockModel = {
            predict: jest.fn().mockReturnValue({
                arraySync: jest.fn().mockReturnValue([[0.8, 0.2]])
            })
        };

        jest.spyOn(tf, 'loadLayersModel').mockResolvedValue(mockModel);
        jest.spyOn(tf, 'tensor').mockReturnValue('mockTensor' as any);

        await model.load();
        
        const tokens = [
            { type: 'Identifier', value: 'eval', normalized: 'FUNCTION', start: 0, end: 4 }
        ];
        
        const prediction = await model.predict(tokens);
        
        expect(prediction).toBeDefined();
        expect(prediction.confidence).toBeGreaterThan(0);
        expect(prediction.isVulnerable).toBeDefined();
    });

    it('should handle model loading errors', async () => {
        const error = new Error('Failed to load model');
        jest.spyOn(tf, 'loadLayersModel').mockRejectedValue(error);

        await expect(model.load()).rejects.toThrow('Failed to load model');
    });
});
