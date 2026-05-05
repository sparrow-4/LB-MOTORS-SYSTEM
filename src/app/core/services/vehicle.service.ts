import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Vehicle, VehicleStatus } from '../../shared/models/vehicle.model';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'lb_motors_vehicles';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private vehiclesSubject = new BehaviorSubject<Vehicle[]>([]);
  vehicles$: Observable<Vehicle[]> = this.vehiclesSubject.asObservable();

  constructor(private storage: StorageService) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const vehicles = this.storage.get<Vehicle>(STORAGE_KEY);
    this.vehiclesSubject.next(vehicles);
  }

  private saveToStorage(vehicles: Vehicle[]): void {
    this.storage.set(STORAGE_KEY, vehicles);
    this.vehiclesSubject.next(vehicles);
  }

  getAll(): Vehicle[] {
    return this.vehiclesSubject.getValue();
  }

  getById(id: string): Vehicle | undefined {
    return this.getAll().find(v => v.id === id);
  }

  getAvailableVehicles(): Vehicle[] {
    return this.getAll().filter(v => v.status === 'Available');
  }

  add(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Vehicle {
    const now = new Date().toISOString();
    const newVehicle: Vehicle = {
      ...vehicle,
      id: this.storage.generateId(),
      status: 'Available',
      createdAt: now,
      updatedAt: now
    };
    const vehicles = [...this.getAll(), newVehicle];
    this.saveToStorage(vehicles);
    return newVehicle;
  }

  update(id: string, updates: Partial<Vehicle>): Vehicle | undefined {
    const vehicles = this.getAll();
    const index = vehicles.findIndex(v => v.id === id);
    if (index === -1) return undefined;

    vehicles[index] = {
      ...vehicles[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveToStorage([...vehicles]);
    return vehicles[index];
  }

  updateStatus(id: string, status: VehicleStatus): void {
    this.update(id, { status });
  }

  delete(id: string): void {
    const vehicles = this.getAll().filter(v => v.id !== id);
    this.saveToStorage(vehicles);
  }

  getTotalCount(): number {
    return this.getAll().length;
  }

  getSoldCount(): number {
    return this.getAll().filter(v => v.status === 'Sold').length;
  }

  getAvailableCount(): number {
    return this.getAll().filter(v => v.status === 'Available').length;
  }

  getTotalFleetValue(): number {
    return this.getAll()
      .filter(v => v.status === 'Available')
      .reduce((sum, v) => sum + v.price, 0);
  }
}
