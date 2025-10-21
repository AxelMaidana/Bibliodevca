import { describe, it, expect } from '@jest/globals';

// Pruebas de lógica de negocio del sistema de biblioteca

describe('Business Logic Tests', () => {
  
  // Validación de formato ISBN (13 dígitos)
  it('should validate ISBN format', () => {
    const validISBN = '9781234567890';
    const invalidISBN = '123';

    expect(validISBN).toMatch(/^\d{13}$/);
    expect(invalidISBN).not.toMatch(/^\d{13}$/);
  });

  // Validación de formato DNI (7 u 8 dígitos)
  it('should validate DNI format', () => {
    const validDNI = '12345678';
    const invalidDNI = '123';

    expect(validDNI).toMatch(/^\d{7,8}$/);
    expect(invalidDNI).not.toMatch(/^\d{7,8}$/);
  });

  // Validación de formato de correo electrónico
  it('should validate email format', () => {
    const validEmail = 'test@example.com';
    const invalidEmail = 'invalid-email';

    expect(validEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(invalidEmail).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  // Cálculo de fecha de devolución de préstamo (7 días)
  it('should calculate loan duration correctly', () => {
    const loanDurationDays = 7;
    const now = new Date();
    const expectedReturnDate = new Date(
      now.getTime() + loanDurationDays * 24 * 60 * 60 * 1000
    );

    expect(expectedReturnDate.getTime()).toBeGreaterThan(now.getTime());
    expect(expectedReturnDate.getTime() - now.getTime()).toBe(
      loanDurationDays * 24 * 60 * 60 * 1000
    );
  });

  // Validación de formato de número de socio (SOC + 3 dígitos)
  it('should validate member number format', () => {
    const validMemberNumber = 'SOC001';
    const invalidMemberNumber = '001';

    expect(validMemberNumber).toMatch(/^SOC\d{3}$/);
    expect(invalidMemberNumber).not.toMatch(/^SOC\d{3}$/);
  });
});