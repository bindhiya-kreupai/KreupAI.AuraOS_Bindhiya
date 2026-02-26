'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Brain, TrendingUp, Users, DollarSign, Award, Play, CheckCircle } from 'lucide-react';
import AIInsightsDashboard from '@/components/ai/AIInsightsDashboard';
import AttritionPredictor from '@/components/ai/AttritionPredictor';

type PredictiveView = 'models' | 'ai-insights' | 'attrition';

export default function PredictiveAnalyticsPage() {
  const [predictiveView, setPredictiveView] = useState<PredictiveView>('models');
  const [models, setModels] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalModels: 0, activeModels: 0, totalPredictions: 0 });
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    modelType: 'ATTRITION',
    name: '',
    description: '',
    algorithm: 'RANDOM_FOREST',
    targetVariable: '',
  });

  useEffect(() => {
    fetchModels();
    fetchPredictions();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/predictive-models?limit=100');
      if (res.ok) {
        const data = await res.json();
        setModels(data.data || []);
        setStats((prev) => ({
          ...prev,
          totalModels: data.meta?.total || 0,
          activeModels: data.data?.filter((m: any) => m.isActive).length || 0,
        }));
      }
    } catch (_error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPredictions = async () => {
    try {
      const res = await fetch('/api/v1/predictions?limit=50');
      if (res.ok) {
        const data = await res.json();
        setPredictions(data.data || []);
        setStats((prev) => ({ ...prev, totalPredictions: data.meta?.total || 0 }));
      }
    } catch (_error) {
      console.error('Error fetching predictions:', error);
    }
  };

  const handleCreateModel = async () => {
    try {
      const res = await fetch('/api/v1/predictive-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          features: [],
          trainingDataQuery: 'SELECT * FROM Employee',
        }),
      });

      if (res.ok) {
        setIsCreateOpen(false);
        setFormData({
          modelType: 'ATTRITION',
          name: '',
          description: '',
          algorithm: 'RANDOM_FOREST',
          targetVariable: '',
        });
        fetchModels();
      }
    } catch (_error) {
      console.error('Error creating model:', error);
    }
  };

  const handleTrainModel = async (modelId: string) => {
    try {
      const res = await fetch(`/api/v1/predictive-models/${modelId}/train`, {
        method: 'POST',
      });

      if (res.ok) {
        fetchModels();
        alert('Model training started successfully');
      }
    } catch (_error) {
      console.error('Error training model:', error);
    }
  };

  const modelTypeIcons: Record<string, any> = {
    ATTRITION: { icon: Users, color: 'text-red-600' },
    HIRING_DEMAND: { icon: TrendingUp, color: 'text-blue-600' },
    PERFORMANCE: { icon: Award, color: 'text-yellow-600' },
    SALARY: { icon: DollarSign, color: 'text-green-600' },
    ENGAGEMENT: { icon: Brain, color: 'text-purple-600' },
  };

  const getModelTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      ATTRITION: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400',
      HIRING_DEMAND: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400',
      PERFORMANCE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400',
      SALARY: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400',
      ENGAGEMENT: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-400',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-400';
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-400',
      TRAINING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400',
      TRAINED: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400',
      FAILED: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-400';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (predictiveView === 'ai-insights') {
    return (
      <div className="space-y-4">
        <div className="border-b border-slate-200">
          <div className="flex gap-0">
            {[
              { id: 'models', label: 'ML Models' },
              { id: 'ai-insights', label: 'AI Insights Dashboard' },
              { id: 'attrition', label: 'Attrition Predictor' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPredictiveView(tab.id as PredictiveView)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  predictiveView === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <AIInsightsDashboard />
      </div>
    );
  }

  if (predictiveView === 'attrition') {
    return (
      <div className="space-y-4">
        <div className="border-b border-slate-200">
          <div className="flex gap-0">
            {[
              { id: 'models', label: 'ML Models' },
              { id: 'ai-insights', label: 'AI Insights Dashboard' },
              { id: 'attrition', label: 'Attrition Predictor' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPredictiveView(tab.id as PredictiveView)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  predictiveView === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <AttritionPredictor />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View switcher */}
      <div className="border-b border-slate-200">
        <div className="flex gap-0">
          {[
            { id: 'models', label: 'ML Models' },
            { id: 'ai-insights', label: 'AI Insights Dashboard' },
            { id: 'attrition', label: 'Attrition Predictor' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPredictiveView(tab.id as PredictiveView)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                predictiveView === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Predictive Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Train and deploy ML models for workforce predictions
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>Create Model</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Predictive Model</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="modelType">Model Type</Label>
                <Select
                  value={formData.modelType}
                  onValueChange={(value) => setFormData({ ...formData, modelType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ATTRITION">Attrition Prediction</SelectItem>
                    <SelectItem value="HIRING_DEMAND">Hiring Demand</SelectItem>
                    <SelectItem value="PERFORMANCE">Performance Prediction</SelectItem>
                    <SelectItem value="SALARY">Salary Prediction</SelectItem>
                    <SelectItem value="ENGAGEMENT">Engagement Score</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">Model Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Q1 2024 Attrition Model"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="algorithm">Algorithm</Label>
                  <Select
                    value={formData.algorithm}
                    onValueChange={(value) => setFormData({ ...formData, algorithm: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RANDOM_FOREST">Random Forest</SelectItem>
                      <SelectItem value="GRADIENT_BOOST">Gradient Boosting</SelectItem>
                      <SelectItem value="NEURAL_NETWORK">Neural Network</SelectItem>
                      <SelectItem value="LINEAR_REGRESSION">Linear Regression</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="targetVariable">Target Variable</Label>
                  <Input
                    id="targetVariable"
                    value={formData.targetVariable}
                    onChange={(e) => setFormData({ ...formData, targetVariable: e.target.value })}
                    placeholder="e.g., isAttrition"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateModel}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Models
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalModels}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Models
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeModels}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPredictions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Models List */}
      <Card>
        <CardHeader>
          <CardTitle>Predictive Models</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading models...</div>
          ) : models.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No models found. Create your first predictive model.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Model</th>
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-left py-3 px-4 font-medium">Algorithm</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Accuracy</th>
                    <th className="text-right py-3 px-4 font-medium">Version</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((model) => {
                    const IconConfig = modelTypeIcons[model.modelType] || {
                      icon: Brain,
                      color: 'text-gray-600',
                    };
                    const Icon = IconConfig.icon;
                    return (
                      <tr key={model.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${IconConfig.color}`} />
                            <div>
                              <div className="font-medium">{model.name}</div>
                              {model.description && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {model.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getModelTypeBadgeColor(
                              model.modelType
                            )}`}
                          >
                            {model.modelType}
                          </span>
                        </td>
                        <td className="py-3 px-4">{model.algorithm}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                              model.status
                            )}`}
                          >
                            {model.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {model.trainingMetrics?.accuracy
                            ? `${(model.trainingMetrics.accuracy * 100).toFixed(1)}%`
                            : '-'}
                        </td>
                        <td className="py-3 px-4 text-right">v{model.version}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            {model.status === 'DRAFT' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTrainModel(model.id)}
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Train
                              </Button>
                            )}
                            {model.status === 'TRAINED' && (
                              <Button variant="outline" size="sm">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Predict
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Predictions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          {predictions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No predictions yet. Train a model and make predictions.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Model</th>
                    <th className="text-left py-3 px-4 font-medium">Entity ID</th>
                    <th className="text-right py-3 px-4 font-medium">Prediction</th>
                    <th className="text-right py-3 px-4 font-medium">Confidence</th>
                    <th className="text-left py-3 px-4 font-medium">Predicted At</th>
                    <th className="text-left py-3 px-4 font-medium">Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((prediction) => (
                    <tr key={prediction.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{prediction.model?.name || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">
                          {prediction.model?.modelType}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm">{prediction.entityId || '-'}</td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {typeof prediction.predictionValue === 'number'
                          ? prediction.predictionValue.toFixed(2)
                          : prediction.predictionValue}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={getConfidenceColor(prediction.confidence)}>
                          {(prediction.confidence * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {new Date(prediction.predictedAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        {prediction.actualValue ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <span className="text-xs text-muted-foreground">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
