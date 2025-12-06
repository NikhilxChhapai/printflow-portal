import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrders } from '@/contexts/OrderContext';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/lib/types';
import * as api from '@/lib/api';

interface ProductField {
  id: string;
  name: string;
  qty: number;
}

const CreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const { createOrder } = useOrders();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const [formData, setFormData] = useState({
    orderId: '',
    clientName: '',
    deliveryDate: '',
    notes: '',
    assignedTo: '',
  });

  const [products, setProducts] = useState<ProductField[]>([
    { id: '1', name: '', qty: 1 },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadUsers = async () => {
      const data = await api.fetchUsers();
      setUsers(data);
    };
    loadUsers();

    // Generate default order ID
    const now = new Date();
    const defaultId = `ORD-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    setFormData(prev => ({ ...prev, orderId: defaultId }));
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleProductChange = (id: string, field: 'name' | 'qty', value: string | number) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const addProduct = () => {
    setProducts(prev => [...prev, { id: Date.now().toString(), name: '', qty: 1 }]);
  };

  const removeProduct = (id: string) => {
    if (products.length > 1) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.orderId.trim()) {
      newErrors.orderId = 'Order ID is required';
    }
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }
    if (!formData.deliveryDate) {
      newErrors.deliveryDate = 'Delivery date is required';
    }

    const validProducts = products.filter(p => p.name.trim());
    if (validProducts.length === 0) {
      newErrors.products = 'At least one product is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const validProducts = products
        .filter(p => p.name.trim())
        .map(p => ({ name: p.name, qty: p.qty }));

      const assignedUser = users.find(u => u.id === formData.assignedTo);

      await createOrder({
        orderId: formData.orderId,
        clientName: formData.clientName,
        products: validProducts,
        deliveryDate: formData.deliveryDate,
        notes: formData.notes,
        assignedTo: formData.assignedTo || undefined,
        assignedToName: assignedUser?.name,
      });

      toast({
        title: 'Order created!',
        description: `${formData.orderId} has been added to the workflow.`,
      });

      navigate('/orders');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not create order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Create Order</h1>
        <p className="text-muted-foreground">Add a new order manually</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>Enter the order information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order ID & Client */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="orderId">Order ID *</Label>
                <Input
                  id="orderId"
                  value={formData.orderId}
                  onChange={(e) => handleInputChange('orderId', e.target.value)}
                  placeholder="ORD-2024-001"
                  className={errors.orderId ? 'border-destructive' : ''}
                />
                {errors.orderId && (
                  <p className="text-sm text-destructive">{errors.orderId}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="Enter client name"
                  className={errors.clientName ? 'border-destructive' : ''}
                />
                {errors.clientName && (
                  <p className="text-sm text-destructive">{errors.clientName}</p>
                )}
              </div>
            </div>

            {/* Products */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Products *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addProduct}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Product
                </Button>
              </div>
              {products.map((product, index) => (
                <div key={product.id} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <Input
                      placeholder="Product name"
                      value={product.name}
                      onChange={(e) => handleProductChange(product.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={product.qty}
                      onChange={(e) => handleProductChange(product.id, 'qty', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  {products.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              ))}
              {errors.products && (
                <p className="text-sm text-destructive">{errors.products}</p>
              )}
            </div>

            {/* Delivery Date & Assignment */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="deliveryDate">Delivery Date *</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={errors.deliveryDate ? 'border-destructive' : ''}
                />
                {errors.deliveryDate && (
                  <p className="text-sm text-destructive">{errors.deliveryDate}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assign To (optional)</Label>
                <Select
                  value={formData.assignedTo}
                  onValueChange={(value) => handleInputChange('assignedTo', value)}
                >
                  <SelectTrigger id="assignedTo">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional notes..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-none">
            {isSubmitting ? 'Creating...' : 'Create Order'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrder;
