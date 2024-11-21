"use client"
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash } from "lucide-react";
import axios from "axios";
import type { ModelTemplate } from "@prisma/client"
export default function ModelManagementPage() {

  const [models, setModels] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    modelId: '',
    avatar: '',
    description: '',
    baseEndpoint: 'https://api.openai.com/v1',
  });

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await axios.get('/api/model-templates');
      setModels(response.data);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/model-templates', formData);
      fetchModels();
      setFormData({
        name: '',
        modelId: '',
        avatar: '',
        description: '',
        baseEndpoint: 'https://api.openai.com/v1',
      });
    } catch (error) {
      console.error('Failed to create model:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this model?')) {
      try {
        await axios.delete(`/api/model-templates/${id}`);
        fetchModels();
      } catch (error) {
        console.error('Failed to delete model:', error);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Model Templates</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Model
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Model Template</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Model ID</label>
                <Input
                  value={formData.modelId}
                  onChange={(e) => setFormData({...formData, modelId: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Base Endpoint</label>
                <Input
                  value={formData.baseEndpoint}
                  onChange={(e) => setFormData({...formData, baseEndpoint: e.target.value})}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Create Model</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {models.map((model : ModelTemplate) => (
          <div key={model.id} className="border p-4 rounded-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{model.name}</h3>
              <p className="text-sm text-gray-500">{model.modelId}</p>
              <p className="text-sm">{model.description}</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleDelete(model.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}