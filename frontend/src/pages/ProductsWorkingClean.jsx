import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Package,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';

export default function ProductsWorkingClean() {
  console.log('🔍 ProductsWorkingClean component starting to render...');
  
  // Test hooks one at a time to isolate crash
  const { toast } = useToast();
  console.log('🔍 useToast hook loaded successfully');
  
  console.log('🔍 ProductsWorkingClean component about to return JSX...');
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">ProductsWorking Debug</h1>
      <p>Component is mounting successfully!</p>
      <p>useToast hook: ✅ Working</p>
      <p>Time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}
