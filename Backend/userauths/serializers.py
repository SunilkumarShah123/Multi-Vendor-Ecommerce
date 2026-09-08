from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import Profile, User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields="__all__"

class ProfileSerializer(serializers.ModelSerializer):
    user=UserSerializer()
    class Meta:
        model=Profile
        fields="__all__"

    #to_representation() is used to control and manipulate the output data of a serializer before it is returned to the client, converting a Python/model object into a JSON-compatible representation.
    # def to_representation(self, instance):
    #     data=super().to_representation(instance)
    #     data["full_name"]= data["email"].upper()
    #     return data

class MyTokenObtainPariSerializer(TokenObtainPairSerializer):
    #it will only reveal the payload data like fullname email user etc while decrypting but will not send this at forntend 
    #so inorder to send the payload data along with refresh token and access token we have to user the validate method and send data via that
    @classmethod
    def get_token(cls, user):
        token=super().get_token(user)
        token["full_name"]=user.full_name
        token["email"]=user.email
        token["username"]=user.username
        try:
            token['vendor_id']=user.verdor.id
        except:
            token['vendor_id']=0
        return token
    
    def validate(self, attrs):
        data=super().validate(attrs)
        data["id"]=self.user.id
        data["full_name"]=self.user.full_name
        data["email"]=self.user.email
        data["phone"]=self.user.phone
        return data
    
class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )

    password2 = serializers.CharField(
        write_only=True,
        required=True
    )

    class Meta:
        model = User
        fields = ["full_name", "email", "phone", "password", "password2"]

    def validate(self, attrs):

        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError(
                "Confirm Password and Password must be same"
            )

        return attrs

    def create(self, validated_data):

        user = User.objects.create(
            full_name=validated_data["full_name"],
            email=validated_data["email"],
            phone=validated_data["phone"]
        )

        user.set_password(validated_data["password"])
        user.save()

        return user
    
