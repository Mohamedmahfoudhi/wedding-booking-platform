import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';
import { Category } from '../entities/category.entity';
import { User, UserRole } from '../entities/user.entity';

config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
  synchronize: false,
});

const categories = [
  {
    name: 'Salles des Fêtes',
    nameAr: 'قاعات الأفراح',
    slug: 'salles-des-fetes',
    description: 'Wedding venues and event halls',
    icon: 'pi-building',
    displayOrder: 1,
  },
  {
    name: 'Photographes',
    nameAr: 'المصورون',
    slug: 'photographes',
    description: 'Professional wedding photographers',
    icon: 'pi-camera',
    displayOrder: 2,
  },
  {
    name: 'Voitures de Mariage',
    nameAr: 'سيارات الزفاف',
    slug: 'voitures-mariage',
    description: 'Wedding cars and transportation',
    icon: 'pi-car',
    displayOrder: 3,
  },
  {
    name: 'Notaires',
    nameAr: 'الموثقون',
    slug: 'notaires',
    description: 'Notary services for marriage',
    icon: 'pi-file',
    displayOrder: 4,
  },
  {
    name: 'Coiffeurs',
    nameAr: 'مصففو الشعر',
    slug: 'coiffeurs',
    description: 'Hair stylists and makeup artists',
    icon: 'pi-user',
    displayOrder: 5,
  },
  {
    name: 'Robes de Mariage',
    nameAr: 'فساتين الزفاف',
    slug: 'robes-mariage',
    description: 'Wedding dresses and bridal wear',
    icon: 'pi-heart',
    displayOrder: 6,
  },
  {
    name: 'Costumes de Mariage',
    nameAr: 'بدل الزفاف',
    slug: 'costumes-mariage',
    description: 'Groom suits and formal wear',
    icon: 'pi-user',
    displayOrder: 7,
  },
  {
    name: 'Bands & DJ',
    nameAr: 'الفرق الموسيقية',
    slug: 'bands-dj',
    description: 'Music bands and DJs',
    icon: 'pi-volume-up',
    displayOrder: 8,
  },
  {
    name: 'Décorations',
    nameAr: 'الديكور',
    slug: 'decorations',
    description: 'Event decorations and styling',
    icon: 'pi-star',
    displayOrder: 9,
  },
  {
    name: 'Traiteurs',
    nameAr: 'خدمات الطعام',
    slug: 'traiteurs',
    description: 'Catering services',
    icon: 'pi-shopping-bag',
    displayOrder: 10,
  },
  {
    name: 'Gâteaux',
    nameAr: 'الحلويات',
    slug: 'gateaux',
    description: 'Wedding cakes and pastries',
    icon: 'pi-gift',
    displayOrder: 11,
  },
  {
    name: 'Fleuristes',
    nameAr: 'باعة الزهور',
    slug: 'fleuristes',
    description: 'Florists and flower arrangements',
    icon: 'pi-sun',
    displayOrder: 12,
  },
];

async function seed() {
  try {
    await dataSource.initialize();
    console.log('Database connected');

    const categoryRepository = dataSource.getRepository(Category);
    const userRepository = dataSource.getRepository(User);

    // Seed categories
    console.log('Seeding categories...');
    for (const categoryData of categories) {
      const existing = await categoryRepository.findOne({
        where: { slug: categoryData.slug },
      });

      if (!existing) {
        const category = categoryRepository.create(categoryData);
        await categoryRepository.save(category);
        console.log(`Created category: ${categoryData.name}`);
      } else {
        console.log(`Category already exists: ${categoryData.name}`);
      }
    }

    // Seed admin user
    console.log('Seeding admin user...');
    const adminEmail = 'admin@weddingplatform.tn';
    const existingAdmin = await userRepository.findOne({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      const admin = userRepository.create({
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        isVerified: true,
        isActive: true,
      });
      await userRepository.save(admin);
      console.log('Created admin user:', adminEmail);
    } else {
      console.log('Admin user already exists');
    }

    console.log('Seeding completed!');
    await dataSource.destroy();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
