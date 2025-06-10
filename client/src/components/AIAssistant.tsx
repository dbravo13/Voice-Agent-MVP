import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MessageCircle, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const AIAssistant = () => {
  return (
    <section className="py-12 lg:py-20 bg-gradient-to-br from-muted/20 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ask our{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                AI Assistant
              </span>{" "}
              what suits you best
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get personalized product recommendations based on your needs,
              budget, and preferences. Our AI understands technology like a
              human expert.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="glass-effect border-primary/20">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Chat with AI</h3>
                <p className="text-sm text-muted-foreground">
                  Have a conversation about your tech needs
                </p>
              </CardContent>
            </Card>

            <Card className="glass-effect border-primary/20">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
                  <Mic className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-semibold">Voice Assistant</h3>
                <p className="text-sm text-muted-foreground">
                  Simply speak your requirements naturally
                </p>
              </CardContent>
            </Card>

            <Card className="glass-effect border-primary/20">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">Smart Recommendations</h3>
                <p className="text-sm text-muted-foreground">
                  Get instant, personalized product suggestions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAssistant;
