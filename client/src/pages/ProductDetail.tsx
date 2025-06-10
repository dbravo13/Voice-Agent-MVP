
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProduct, useSimilarProducts } from "@/hooks/useProducts";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useProduct(id || "");
  const { data: similarProducts } = useSimilarProducts(id || "", product?.category || "", 3);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="animate-pulse">
            <div className="h-8 bg-muted/20 rounded w-48 mb-8"></div>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              <div className="aspect-square bg-muted/20 rounded-2xl"></div>
              <div className="space-y-6">
                <div className="h-8 bg-muted/20 rounded w-32"></div>
                <div className="h-12 bg-muted/20 rounded"></div>
                <div className="h-20 bg-muted/20 rounded"></div>
                <div className="h-8 bg-muted/20 rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to products
          </Link>
        </div>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden glass-effect p-1">
              <img
                src={product.image_url || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop"}
                alt={product.name}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="space-y-4">
              <Badge variant="outline" className="border-primary/50 text-primary">
                {product.category}
              </Badge>
              
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                {product.name}
              </h1>
              
              {product.brand && (
                <p className="text-lg text-muted-foreground">
                  by <span className="font-semibold">{product.brand}</span>
                </p>
              )}
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                {product.description}
              </p>
              
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-primary">
                  ${product.price.toLocaleString()}
                </div>
                {product.rating > 0 && (
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-lg font-medium">{product.rating}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Specifications */}
            {product.specs && product.specs.length > 0 && (
              <Card className="glass-effect border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Key Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {product.specs.map((spec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-sm text-muted-foreground">{spec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  size="lg" 
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground glow-effect"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-primary/50 text-primary hover:bg-primary/10"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full border-secondary/50 text-secondary hover:bg-secondary/10"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Ask AI about this product
              </Button>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts && similarProducts.length > 0 && (
          <section className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl lg:text-3xl font-bold">
                Similar{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Products
                </span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                You might also be interested in these products from the same category.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
