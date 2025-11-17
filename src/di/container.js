/**
 * Dependency Injection Container
 * Single place where all dependencies are wired together
 * Factory pattern for creating instances
 * @version 5.1.0
 */

// Repositories
const MongoProductRepository = require('../infrastructure/database/mongodb/repositories/MongoProductRepository');
const MongoOrderRepository = require('../infrastructure/database/mongodb/repositories/MongoOrderRepository');
const MongoCategoryRepository = require('../infrastructure/database/mongodb/repositories/MongoCategoryRepository');
const MongoReviewRepository = require('../infrastructure/database/mongodb/repositories/MongoReviewRepository');

// Services
const BrevoEmailService = require('../infrastructure/services/BrevoEmailService');
const CloudinaryStorageService = require('../infrastructure/services/CloudinaryStorageService');

// Use Cases - Products
const CreateProductUseCase = require('../application/use-cases/products/CreateProduct.usecase');
const UpdateProductUseCase = require('../application/use-cases/products/UpdateProduct.usecase');
const DeleteProductUseCase = require('../application/use-cases/products/DeleteProduct.usecase');
const GetProductsUseCase = require('../application/use-cases/products/GetProducts.usecase');

// Use Cases - Orders
const CreateOrderUseCase = require('../application/use-cases/orders/CreateOrder.usecase');
const ConfirmPaymentUseCase = require('../application/use-cases/orders/ConfirmPayment.usecase');
const UpdateOrderStatusUseCase = require('../application/use-cases/orders/UpdateOrderStatus.usecase');
const GetOrdersUseCase = require('../application/use-cases/orders/GetOrders.usecase');

// Use Cases - Categories & Reviews
const ManageCategoriesUseCase = require('../application/use-cases/categories/ManageCategories.usecase');
const ManageReviewsUseCase = require('../application/use-cases/reviews/ManageReviews.usecase');

// Controllers
const ProductController = require('../presentation/http/controllers/ProductController');
const OrderController = require('../presentation/http/controllers/OrderController');
const CategoryController = require('../presentation/http/controllers/CategoryController');
const ReviewController = require('../presentation/http/controllers/ReviewController');

class Container {
  constructor() {
    this.instances = {};
  }

  // ========== REPOSITORIES ==========
  getProductRepository() {
    if (!this.instances.productRepository) {
      this.instances.productRepository = new MongoProductRepository();
    }
    return this.instances.productRepository;
  }

  getOrderRepository() {
    if (!this.instances.orderRepository) {
      this.instances.orderRepository = new MongoOrderRepository();
    }
    return this.instances.orderRepository;
  }

  getCategoryRepository() {
    if (!this.instances.categoryRepository) {
      this.instances.categoryRepository = new MongoCategoryRepository();
    }
    return this.instances.categoryRepository;
  }

  getReviewRepository() {
    if (!this.instances.reviewRepository) {
      this.instances.reviewRepository = new MongoReviewRepository();
    }
    return this.instances.reviewRepository;
  }

  // ========== SERVICES ==========
  getEmailService() {
    if (!this.instances.emailService) {
      // Lazy initialization - only create when first called
      this.instances.emailService = new BrevoEmailService();
    }
    return this.instances.emailService;
  }

  getStorageService() {
    if (!this.instances.storageService) {
      // Lazy initialization - only create when first called
      this.instances.storageService = new CloudinaryStorageService();
    }
    return this.instances.storageService;
  }

  // ========== USE CASES - PRODUCTS ==========
  getCreateProductUseCase() {
    if (!this.instances.createProductUseCase) {
      this.instances.createProductUseCase = new CreateProductUseCase(
        this.getProductRepository(),
        this.getCategoryRepository()
      );
    }
    return this.instances.createProductUseCase;
  }

  getUpdateProductUseCase() {
    if (!this.instances.updateProductUseCase) {
      this.instances.updateProductUseCase = new UpdateProductUseCase(
        this.getProductRepository(),
        this.getCategoryRepository()
      );
    }
    return this.instances.updateProductUseCase;
  }

  getDeleteProductUseCase() {
    if (!this.instances.deleteProductUseCase) {
      this.instances.deleteProductUseCase = new DeleteProductUseCase(
        this.getProductRepository()
      );
    }
    return this.instances.deleteProductUseCase;
  }

  getGetProductsUseCase() {
    if (!this.instances.getProductsUseCase) {
      this.instances.getProductsUseCase = new GetProductsUseCase(
        this.getProductRepository()
      );
    }
    return this.instances.getProductsUseCase;
  }

  // ========== USE CASES - ORDERS ==========
  getCreateOrderUseCase() {
    if (!this.instances.createOrderUseCase) {
      this.instances.createOrderUseCase = new CreateOrderUseCase(
        this.getOrderRepository(),
        this.getProductRepository(),
        this.getEmailService()
      );
    }
    return this.instances.createOrderUseCase;
  }

  getConfirmPaymentUseCase() {
    if (!this.instances.confirmPaymentUseCase) {
      this.instances.confirmPaymentUseCase = new ConfirmPaymentUseCase(
        this.getOrderRepository(),
        this.getEmailService()
      );
    }
    return this.instances.confirmPaymentUseCase;
  }

  getUpdateOrderStatusUseCase() {
    if (!this.instances.updateOrderStatusUseCase) {
      this.instances.updateOrderStatusUseCase = new UpdateOrderStatusUseCase(
        this.getOrderRepository(),
        this.getEmailService()
      );
    }
    return this.instances.updateOrderStatusUseCase;
  }

  getGetOrdersUseCase() {
    if (!this.instances.getOrdersUseCase) {
      this.instances.getOrdersUseCase = new GetOrdersUseCase(
        this.getOrderRepository()
      );
    }
    return this.instances.getOrdersUseCase;
  }

  // ========== USE CASES - CATEGORIES & REVIEWS ==========
  getManageCategoriesUseCase() {
    if (!this.instances.manageCategoriesUseCase) {
      this.instances.manageCategoriesUseCase = new ManageCategoriesUseCase(
        this.getCategoryRepository()
      );
    }
    return this.instances.manageCategoriesUseCase;
  }

  getManageReviewsUseCase() {
    if (!this.instances.manageReviewsUseCase) {
      this.instances.manageReviewsUseCase = new ManageReviewsUseCase(
        this.getReviewRepository()
      );
    }
    return this.instances.manageReviewsUseCase;
  }

  // ========== CONTROLLERS ==========
  getProductController() {
    if (!this.instances.productController) {
      this.instances.productController = new ProductController(
        this.getCreateProductUseCase(),
        this.getUpdateProductUseCase(),
        this.getDeleteProductUseCase(),
        this.getGetProductsUseCase()
      );
    }
    return this.instances.productController;
  }

  getOrderController() {
    if (!this.instances.orderController) {
      this.instances.orderController = new OrderController(
        this.getCreateOrderUseCase(),
        this.getConfirmPaymentUseCase(),
        this.getUpdateOrderStatusUseCase(),
        this.getGetOrdersUseCase()
      );
    }
    return this.instances.orderController;
  }

  getCategoryController() {
    if (!this.instances.categoryController) {
      this.instances.categoryController = new CategoryController(
        this.getManageCategoriesUseCase()
      );
    }
    return this.instances.categoryController;
  }

  getReviewController() {
    if (!this.instances.reviewController) {
      this.instances.reviewController = new ReviewController(
        this.getManageReviewsUseCase()
      );
    }
    return this.instances.reviewController;
  }
}

// Export singleton instance
module.exports = new Container();

