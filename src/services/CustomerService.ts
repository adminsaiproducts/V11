// src/services/CustomerService.ts
// Refactored to use REST API-based FirestoreService instead of FirestoreApp library
// This enables proper support for non-default database IDs like 'crm-database-v9'
import { Customer, CustomerListResponse } from '../models/Customer';
import { FirestoreService } from './firestore';

export class CustomerService {
  private firestore: FirestoreService;
  private collection: string;

  constructor() {
    this.firestore = new FirestoreService();
    this.collection = 'customers'; // Collection name in Firestore
  }

  /**
   * Get list of customers with pagination
   * Uses REST API for proper database ID support
   */
  getCustomers(page: number, pageSize: number): CustomerListResponse {
    // Fetch customers using REST API-based FirestoreService
    const allCustomers = this.firestore.listDocuments<Customer>(this.collection, 10000);

    const total = allCustomers.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pagedData = allCustomers.slice(startIndex, endIndex);

    return {
      data: pagedData,
      total: total,
      page,
      pageSize
    };
  }

  /**
   * Search customers by name, email, or phone
   */
  searchCustomers(query: string): Customer[] {
    const allCustomers = this.firestore.listDocuments<Customer>(this.collection, 10000);

    if (!query) return allCustomers;

    const lowerQuery = query.toLowerCase();
    return allCustomers.filter((c: Customer) =>
      (c.name && c.name.toLowerCase().includes(lowerQuery)) ||
      (c.email && c.email.toLowerCase().includes(lowerQuery)) ||
      (c.phone && c.phone.includes(query))
    );
  }

  /**
   * Get single customer by ID
   */
  getCustomerById(id: string): Customer | null {
    try {
      const customer = this.firestore.getDocument<Customer>(this.collection, id);
      if (!customer) return null;
      return { ...customer, id } as Customer;
    } catch (e) {
      console.warn(`Customer ${id} not found or error: ${e}`);
      return null;
    }
  }
  /**
   * Create a new customer
   */
  createCustomer(data: any): Customer {
    const id = Utilities.getUuid();
    const now = new Date().toISOString();

    const customer: Customer = {
      id,
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      zipCode: data.zipCode || '',
      prefecture: data.prefecture || '',
      city: data.city || '',
      address1: data.address1 || '',
      address2: data.address2 || '',
      status: data.status || 'lead',
      createdAt: now,
      updatedAt: now
    };

    this.firestore.setDocument(this.collection, id, customer);
    return customer;
  }
  /**
   * Update an existing customer
   */
  updateCustomer(id: string, data: any): Customer {
    // First check if customer exists and get createdAt
    const existing = this.firestore.getDocument<Customer>(this.collection, id);
    if (!existing) {
      throw new Error(`Customer with ID ${id} not found.`);
    }

    const now = new Date().toISOString();
    const updatedCustomer: Customer = {
      id,
      name: data.name || existing.name || '',
      email: data.email || existing.email || '',
      phone: data.phone || existing.phone || '',
      zipCode: data.zipCode || existing.zipCode || '',
      prefecture: data.prefecture || existing.prefecture || '',
      city: data.city || existing.city || '',
      address1: data.address1 || existing.address1 || '',
      address2: data.address2 || existing.address2 || '',
      status: data.status || existing.status || 'lead',
      createdAt: existing.createdAt || now, // Preserve original creation time
      updatedAt: now
    };

    this.firestore.setDocument(this.collection, id, updatedCustomer);
    return updatedCustomer;
  }

  /**
   * Fetch address from zip code using external API
   * Returns all matching addresses (some zip codes have multiple cities)
   */
  getAddressByZipCode(zipCode: string): Array<{ prefecture: string; city: string; address1: string }> {
    if (!zipCode || zipCode.length < 7) return [];

    // Remove hyphen if present (e.g., "123-4567" -> "1234567")
    const cleanZipCode = zipCode.replace(/-/g, '');

    try {
      const response = UrlFetchApp.fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanZipCode}`);
      const json = JSON.parse(response.getContentText());

      if (json.status === 200 && json.results && json.results.length > 0) {
        // Return all results (some zip codes have multiple cities)
        return json.results.map((result: any) => ({
          prefecture: result.address1,
          city: result.address2,
          address1: result.address3
        }));
      }
      return [];
    } catch (e) {
      console.warn(`Failed to fetch address for zip code ${zipCode}: ${e}`);
      return [];
    }
  }

  /**
   * Reverse lookup: Find zip code from address using Google Maps Geocoding API
   * Requires GOOGLE_MAPS_API_KEY in Script Properties
   */
  getZipCodeByAddress(prefecture: string, city: string, address1?: string): string | null {
    if (!prefecture) return null;

    try {
      const props = PropertiesService.getScriptProperties();
      const apiKey = props.getProperty('GOOGLE_MAPS_API_KEY');

      if (!apiKey) {
        console.warn('GOOGLE_MAPS_API_KEY not found in Script Properties. Reverse lookup disabled.');
        return null;
      }

      // Build address string
      const addressQuery = [prefecture, city, address1].filter(Boolean).join(' ');
      const encodedAddress = encodeURIComponent(addressQuery);

      // Call Google Maps Geocoding API
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&language=ja&region=jp&key=${apiKey}`;
      const response = UrlFetchApp.fetch(url);
      const json = JSON.parse(response.getContentText());

      if (json.status === 'OK' && json.results && json.results.length > 0) {
        const result = json.results[0];

        // Extract postal code from address components
        const postalCodeComponent = result.address_components.find(
          (component: any) => component.types.includes('postal_code')
        );

        if (postalCodeComponent) {
          return postalCodeComponent.long_name.replace(/-/g, ''); // Remove hyphen
        }
      }

      console.warn(`No postal code found for address: ${addressQuery}`);
      return null;
    } catch (e) {
      console.warn(`Failed to fetch zip code for address ${prefecture} ${city}: ${e}`);
      return null;
    }
  }
}
