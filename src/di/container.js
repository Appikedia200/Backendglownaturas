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
const MongoAdminRepository = require('../infrastructure/database/mongodb/repositories/MongoAdminRepository');
const MongoCartRepository = require('../infrastructure/database/mongodb/repositories/MongoCartRepository');
const MongoMediaRepository = require('../infrastructure/database/mongodb/repositories/MongoMediaRepository');
const MongoSettingsRepository = require('../infrastructure/database/mongodb/repositories/MongoSettingsRepository');
const MongoEmailTemplateRepository = require('../infrastructure/database/mongodb/repositories/MongoEmailTemplateRepository');

// Services
const BrevoEmailService = require('../infrastructure/services/BrevoEmailService');
const CloudinaryStorageService = require('../infrastructure/services/CloudinaryStorageService');

// Use Cases - Products
const CreateProductUseCase = require('../application/use-cases/products/CreateProduct.usecase');
const UpdateProductUseCase = require('../application/use-cases/products/UpdateProduct.usecase');
const DeleteProductUseCase = require('../application/use-cases/products/DeleteProduct.usecase');
const GetProductsUseCase = require('../application/use-cases/products/GetProducts.usecase');
const GetJewelryFiltersUseCase = require('../application/use-cases/products/GetJewelryFilters.usecase');

// Use Cases - Orders
const CreateOrderUseCase = require('../application/use-cases/orders/CreateOrder.usecase');
const ConfirmPaymentUseCase = require('../application/use-cases/orders/ConfirmPayment.usecase');
const UpdateOrderStatusUseCase = require('../application/use-cases/orders/UpdateOrderStatus.usecase');
const GetOrdersUseCase = require('../application/use-cases/orders/GetOrders.usecase');

// Use Cases - Categories & Reviews
const ManageCategoriesUseCase = require('../application/use-cases/categories/ManageCategories.usecase');
const ManageReviewsUseCase = require('../application/use-cases/reviews/ManageReviews.usecase');

// Use Cases - Auth
const LoginUseCase = require('../application/use-cases/auth/Login.usecase');
const RegisterAdminUseCase = require('../application/use-cases/auth/Register.usecase');
const VerifyEmailUseCase = require('../application/use-cases/auth/VerifyEmail.usecase');
const VerifyEmailWithTokenUseCase = require('../application/use-cases/auth/VerifyEmailWithToken.usecase');
const ResetPasswordUseCase = require('../application/use-cases/auth/ResetPassword.usecase');
const ResendVerificationUseCase = require('../application/use-cases/auth/ResendVerification.usecase');

// Use Cases - Cart, Media, Settings, Dashboard, Email Templates
const ManageCartUseCase = require('../application/use-cases/cart/ManageCart.usecase');
const ManageMediaUseCase = require('../application/use-cases/media/ManageMedia.usecase');
const ManageSettingsUseCase = require('../application/use-cases/settings/ManageSettings.usecase');
const GetStatisticsUseCase = require('../application/use-cases/dashboard/GetStatistics.usecase');
const ManageEmailTemplatesUseCase = require('../application/use-cases/email-templates/ManageEmailTemplates.usecase');

// Controllers
const ProductController = require('../presentation/http/controllers/ProductController');
const OrderController = require('../presentation/http/controllers/OrderController');
const CategoryController = require('../presentation/http/controllers/CategoryController');
const ReviewController = require('../presentation/http/controllers/ReviewController');
const AuthController = require('../presentation/http/controllers/AuthController');
const CartController = require('../presentation/http/controllers/CartController');
const MediaController = require('../presentation/http/controllers/MediaController');
const SettingsController = require('../presentation/http/controllers/SettingsController');
const DashboardController = require('../presentation/http/controllers/DashboardController');
const EmailTemplateController = require('../presentation/http/controllers/EmailTemplateController');

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

  getGetJewelryFiltersUseCase() {
    if (!this.instances.getJewelryFiltersUseCase) {
      this.instances.getJewelryFiltersUseCase = new GetJewelryFiltersUseCase(
        this.getProductRepository()
      );
    }
    return this.instances.getJewelryFiltersUseCase;
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
        this.getGetProductsUseCase(),
        this.getGetJewelryFiltersUseCase()
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

  // ========== NEW REPOSITORIES ==========
  getAdminRepository() {
    if (!this.instances.adminRepository) {
      this.instances.adminRepository = new MongoAdminRepository();
    }
    return this.instances.adminRepository;
  }

  getCartRepository() {
    if (!this.instances.cartRepository) {
      this.instances.cartRepository = new MongoCartRepository();
    }
    return this.instances.cartRepository;
  }

  getMediaRepository() {
    if (!this.instances.mediaRepository) {
      this.instances.mediaRepository = new MongoMediaRepository();
    }
    return this.instances.mediaRepository;
  }

  getSettingsRepository() {
    if (!this.instances.settingsRepository) {
      this.instances.settingsRepository = new MongoSettingsRepository();
    }
    return this.instances.settingsRepository;
  }

  getEmailTemplateRepository() {
    if (!this.instances.emailTemplateRepository) {
      this.instances.emailTemplateRepository = new MongoEmailTemplateRepository();
    }
    return this.instances.emailTemplateRepository;
  }

  // ========== AUTH USE CASES ==========
  getLoginUseCase() {
    if (!this.instances.loginUseCase) {
      this.instances.loginUseCase = new LoginUseCase(
        this.getAdminRepository()
      );
    }
    return this.instances.loginUseCase;
  }

  getRegisterUseCase() {
    if (!this.instances.registerUseCase) {
      this.instances.registerUseCase = new RegisterAdminUseCase(
        this.getAdminRepository(),
        this.getEmailService()
      );
    }
    return this.instances.registerUseCase;
  }

  getVerifyEmailUseCase() {
    if (!this.instances.verifyEmailUseCase) {
      this.instances.verifyEmailUseCase = new VerifyEmailUseCase(
        this.getAdminRepository()
      );
    }
    return this.instances.verifyEmailUseCase;
  }

  getVerifyEmailWithTokenUseCase() {
    if (!this.instances.verifyEmailWithTokenUseCase) {
      this.instances.verifyEmailWithTokenUseCase = new VerifyEmailWithTokenUseCase(
        this.getAdminRepository()
      );
    }
    return this.instances.verifyEmailWithTokenUseCase;
  }

  getResetPasswordUseCase() {
    if (!this.instances.resetPasswordUseCase) {
      this.instances.resetPasswordUseCase = new ResetPasswordUseCase(
        this.getAdminRepository(),
        this.getEmailService()
      );
    }
    return this.instances.resetPasswordUseCase;
  }

  getResendVerificationUseCase() {
    if (!this.instances.resendVerificationUseCase) {
      this.instances.resendVerificationUseCase = new ResendVerificationUseCase(
        this.getAdminRepository(),
        this.getEmailService()
      );
    }
    return this.instances.resendVerificationUseCase;
  }

  // ========== OTHER USE CASES ==========
  getManageCartUseCase() {
    if (!this.instances.manageCartUseCase) {
      this.instances.manageCartUseCase = new ManageCartUseCase(
        this.getCartRepository(),
        this.getProductRepository()
      );
    }
    return this.instances.manageCartUseCase;
  }

  getManageMediaUseCase() {
    if (!this.instances.manageMediaUseCase) {
      this.instances.manageMediaUseCase = new ManageMediaUseCase(
        this.getMediaRepository(),
        this.getStorageService()
      );
    }
    return this.instances.manageMediaUseCase;
  }

  getManageSettingsUseCase() {
    if (!this.instances.manageSettingsUseCase) {
      this.instances.manageSettingsUseCase = new ManageSettingsUseCase(
        this.getSettingsRepository()
      );
    }
    return this.instances.manageSettingsUseCase;
  }

  getGetStatisticsUseCase() {
    if (!this.instances.getStatisticsUseCase) {
      this.instances.getStatisticsUseCase = new GetStatisticsUseCase(
        this.getOrderRepository(),
        this.getProductRepository(),
        this.getCategoryRepository(),
        this.getReviewRepository()
      );
    }
    return this.instances.getStatisticsUseCase;
  }

  getManageEmailTemplatesUseCase() {
    if (!this.instances.manageEmailTemplatesUseCase) {
      this.instances.manageEmailTemplatesUseCase = new ManageEmailTemplatesUseCase(
        this.getEmailTemplateRepository()
      );
    }
    return this.instances.manageEmailTemplatesUseCase;
  }

  // ========== NEW CONTROLLERS ==========
  getAuthController() {
    if (!this.instances.authController) {
      this.instances.authController = new AuthController(
        this.getLoginUseCase(),
        this.getRegisterUseCase(),
        this.getVerifyEmailUseCase(),
        this.getVerifyEmailWithTokenUseCase(),
        this.getResetPasswordUseCase(),
        this.getResendVerificationUseCase()
      );
    }
    return this.instances.authController;
  }

  getCartController() {
    if (!this.instances.cartController) {
      this.instances.cartController = new CartController(
        this.getManageCartUseCase()
      );
    }
    return this.instances.cartController;
  }

  getMediaController() {
    if (!this.instances.mediaController) {
      this.instances.mediaController = new MediaController(
        this.getManageMediaUseCase()
      );
    }
    return this.instances.mediaController;
  }

  getSettingsController() {
    if (!this.instances.settingsController) {
      this.instances.settingsController = new SettingsController(
        this.getManageSettingsUseCase()
      );
    }
    return this.instances.settingsController;
  }

  getDashboardController() {
    if (!this.instances.dashboardController) {
      this.instances.dashboardController = new DashboardController(
        this.getGetStatisticsUseCase()
      );
    }
    return this.instances.dashboardController;
  }

  getEmailTemplateController() {
    if (!this.instances.emailTemplateController) {
      this.instances.emailTemplateController = new EmailTemplateController(
        this.getManageEmailTemplatesUseCase()
      );
    }
    return this.instances.emailTemplateController;
  }
}

// Export singleton instance
module.exports = new Container();

